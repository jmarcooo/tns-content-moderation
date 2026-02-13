import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, 
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    // --- POST: Bulk Upload (9 New Columns) ---
    if (req.method === 'POST') {
      const { tasks } = req.body;
      if (!tasks || tasks.length === 0) return res.status(400).json({ error: "No tasks provided" });

      const values = [];
      const placeholders = tasks.map((t, i) => {
        const offset = i * 9; // 9 columns per row
        values.push(
            t.id, t.tenant, t.title, t.content, t.created_by,
            t.created_time, t.video_uid, t.video_duration, t.raw_media_url
        );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6}, $${offset+7}, $${offset+8}, $${offset+9})`;
      }).join(', ');

      const query = `
        INSERT INTO video_labelling_tasks 
        (source_id, tenant, title, content, created_by, created_time, video_uid, video_duration, raw_media_url)
        VALUES ${placeholders}
      `;

      await client.query(query, values);
      return res.status(200).json({ message: `Successfully uploaded ${tasks.length} tasks.` });
    }

    // --- GET: Fetch Next Task ---
    if (req.method === 'GET') {
      const { username } = req.query;
      const query = `
        UPDATE video_labelling_tasks
        SET status = 'in_progress', 
            assigned_to = $1, 
            assigned_at = COALESCE(assigned_at, NOW()), 
            updated_at = NOW()
        WHERE internal_id = (
          SELECT internal_id FROM video_labelling_tasks
          WHERE status = 'pending'
          ORDER BY internal_id ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        RETURNING *
      `;
      const { rows } = await client.query(query, [username]);
      return res.status(200).json({ task: rows[0] || null });
    }

    // --- PUT: Submit Label ---
    if (req.method === 'PUT') {
      const { id, label, remarks } = req.body;
      const query = `
        UPDATE video_labelling_tasks 
        SET status = 'completed', label = $1, remarks = $2, updated_at = NOW() 
        WHERE internal_id = $3
      `;
      await client.query(query, [label, remarks, id]);
      return res.status(200).json({ success: true });
    }

    // --- PATCH: Release Task ---
    if (req.method === 'PATCH') {
      const { id } = req.body;
      const query = `
        UPDATE video_labelling_tasks
        SET status = 'pending', assigned_to = NULL, assigned_at = NULL
        WHERE internal_id = $1 AND status = 'in_progress'
      `;
      await client.query(query, [id]);
      return res.status(200).json({ success: true });
    }

    // --- DELETE: Export & Wipe (Updated Headers) ---
    if (req.method === 'DELETE') {
      try {
        await client.query('BEGIN');
        const selectQuery = `SELECT * FROM video_labelling_tasks ORDER BY internal_id ASC FOR UPDATE`;
        const { rows } = await client.query(selectQuery);

        if (rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(404).json({ error: "Database is already empty." });
        }

        await client.query(`DELETE FROM video_labelling_tasks`);
        await client.query('COMMIT');

        // Headers matching your requirement
        const headers = [
          "id", "tenant", "title", "content", "created_by", 
          "created_time", "video_uid", "video_duration", "raw_media_url",
          "Moderation Label", "Moderation Remarks", "Moderated By", 
          "Task Assigned Time", "Task Completed Time", "Status"
        ];
        
        let csv = headers.join(",") + "\n";
        
        rows.forEach(row => {
          const safe = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : "";
          const line = [
            row.source_id, row.tenant, row.title, row.content, row.created_by,
            row.created_time, row.video_uid, row.video_duration, row.raw_media_url,
            // Moderation Data
            row.label, row.remarks, row.assigned_to, 
            row.assigned_at, row.updated_at, row.status
          ].map(safe).join(",");
          csv += line + "\n";
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=moderation_export_new.csv');
        return res.status(200).send(csv);

      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
