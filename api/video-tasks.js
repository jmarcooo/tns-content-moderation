import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, 
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    // --- POST: Bulk Upload (15 Columns) ---
    if (req.method === 'POST') {
      const { tasks } = req.body;
      if (!tasks || tasks.length === 0) return res.status(400).json({ error: "No tasks provided" });

      const values = [];
      const placeholders = tasks.map((t, i) => {
        const offset = i * 15;
        values.push(
            t.request_id, t.channel, t.content_id, t.video_title, t.token_id,
            t.data_entry_time, t.ip_country, t.ip_province, t.ip_city, t.user_defined_data,
            t.version, t.results, t.risk_description, t.feedback, t.video_url
        );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6}, $${offset+7}, $${offset+8}, $${offset+9}, $${offset+10}, $${offset+11}, $${offset+12}, $${offset+13}, $${offset+14}, $${offset+15})`;
      }).join(', ');

      const query = `
        INSERT INTO video_labelling_tasks 
        (request_id, channel, content_id, video_title, token_id, data_entry_time, ip_country, ip_province, ip_city, user_defined_data, version, results, risk_description, feedback, video_url)
        VALUES ${placeholders}
      `;

      await client.query(query, values);
      return res.status(200).json({ message: `Successfully uploaded ${tasks.length} tasks.` });
    }

    // --- GET: Fetch Next Task & Set Assignment Time ---
    if (req.method === 'GET') {
      const { username } = req.query;
      
      // We check if 'assigned_at' is already set to avoid overwriting it if the user refreshes
      const query = `
        UPDATE video_labelling_tasks
        SET status = 'in_progress', 
            assigned_to = $1, 
            assigned_at = COALESCE(assigned_at, NOW()), 
            updated_at = NOW()
        WHERE id = (
          SELECT id FROM video_labelling_tasks
          WHERE status = 'pending'
          ORDER BY id ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        RETURNING *
      `;
      const { rows } = await client.query(query, [username]);
      return res.status(200).json({ task: rows[0] || null });
    }

    // --- PUT: Submit Label (Completion) ---
    if (req.method === 'PUT') {
      const { id, label, remarks } = req.body;
      // We update 'updated_at' here to mark the completion time
      const query = `
        UPDATE video_labelling_tasks 
        SET status = 'completed', label = $1, remarks = $2, updated_at = NOW() 
        WHERE id = $3
      `;
      await client.query(query, [label, remarks, id]);
      return res.status(200).json({ success: true });
    }

    // --- DELETE: EXPORT & WIPE (With Assignment Time) ---
    if (req.method === 'DELETE') {
      const query = `DELETE FROM video_labelling_tasks RETURNING *`;
      const { rows } = await client.query(query);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Database is already empty." });
      }

      // Define CSV Headers (Original 15 + New Moderation Data)
      const headers = [
        "URL", "Channel", "Content ID", "Video Title", "Token ID", 
        "Data Entry Time", "Country where IP is located", "Province where IP is located", "The city where the IP is located", 
        "Version", "User-defined data", "Request ID", "Results", "Risk Description", "Feedback",
        
        // --- NEW COLUMNS ---
        "Moderation Label", 
        "Moderation Remarks", 
        "Moderated By", 
        "Task Assigned Time",   // <--- NEW
        "Task Completed Time", 
        "Status"
      ];
      
      let csv = headers.join(",") + "\n";
      
      rows.forEach(row => {
        const safe = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : "";
        
        const line = [
          // Original Data
          row.video_url, row.channel, row.content_id, row.video_title, row.token_id,
          row.data_entry_time, row.ip_country, row.ip_province, row.ip_city,
          row.version, row.user_defined_data, row.request_id, row.results, row.risk_description, row.feedback,
          
          // Moderation Data
          row.label,          
          row.remarks,        
          row.assigned_to,
          row.assigned_at,    // <--- Assignment Time
          row.updated_at,     // <--- Completion Time
          row.status          
        ].map(safe).join(",");
        
        csv += line + "\n";
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=moderation_export_full.csv');
      return res.status(200).send(csv);
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
