import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, // Change to false if using self-signed certs
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    // --- POST: Upload CSV Tasks (Bulk Insert) ---
    if (req.method === 'POST') {
      const { tasks } = req.body;
      if (!tasks || tasks.length === 0) return res.status(400).json({ error: "No tasks provided" });

      // Construct Bulk Insert Query
      // Note: For very large CSVs (>1000 rows), you might want to batch this.
      const values = [];
      const placeholders = tasks.map((t, i) => {
        const offset = i * 4;
        values.push(t.videoSrc, t.textTop, t.textBottom, t.publisher);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
      }).join(', ');

      const query = `
        INSERT INTO video_labelling_tasks (video_url, title, description, publisher)
        VALUES ${placeholders}
        RETURNING id
      `;

      await client.query(query, values);
      return res.status(200).json({ message: `Successfully uploaded ${tasks.length} tasks.` });
    }

    // --- GET: Fetch Next Pending Task (FIFO Queue) ---
    if (req.method === 'GET') {
      const { username } = req.query;
      
      // Atomic Update: Find oldest 'pending' task, lock it, and assign to user
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
        return res.status(200).json({ task: null, message: "No pending tasks available." });
      }
      return res.status(200).json({ task: rows[0] });
    }

    // --- PUT: Submit Label ---
    if (req.method === 'PUT') {
      const { id, label, remarks } = req.body;
      
      const query = `
        UPDATE video_labelling_tasks
        SET status = 'completed', label = $1, remarks = $2, updated_at = NOW()
        WHERE id = $3
      `;
      
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
