import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, 
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    // --- POST: Bulk Upload CSV (15 Columns) ---
    if (req.method === 'POST') {
      const { tasks } = req.body;
      if (!tasks || tasks.length === 0) return res.status(400).json({ error: "No tasks provided" });

      // Construct Bulk Insert for 15 columns
      const values = [];
      const placeholders = tasks.map((t, i) => {
        const offset = i * 15; // 15 columns per row
        values.push(
            t.request_id, t.channel, t.content_id, t.video_title, t.token_id,
            t.data_entry_time, t.ip_country, t.ip_province, t.ip_city, t.user_defined_data,
            t.version, t.results, t.risk_description, t.feedback, t.video_url
        );
        // Generate ($1, $2, ... $15)
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

    // --- GET: Fetch Next Pending Task (FIFO) ---
    if (req.method === 'GET') {
      const { username } = req.query;
      
      // Find oldest pending task, lock it, assign to user
      const query = `
        UPDATE video_labelling_tasks
        SET status = 'in_progress', assigned_to = $1, updated_at = NOW()
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
      
      if (rows.length === 0) {
        return res.status(200).json({ task: null });
      }
      return res.status(200).json({ task: rows[0] });
    }

    // --- PUT: Submit Label ---
    if (req.method === 'PUT') {
      const { id, label, remarks } = req.body;
      const query = `UPDATE video_labelling_tasks SET status = 'completed', label = $1, remarks = $2, updated_at = NOW() WHERE id = $3`;
      await client.query(query, [label, remarks, id]);
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
