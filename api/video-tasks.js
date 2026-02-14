import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, 
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    // --- POST: Upload ---
    if (req.method === 'POST') {
      const { tasks } = req.body;
      if (!tasks || tasks.length === 0) return res.status(400).json({ error: "No tasks provided" });

      const values = [];
      const placeholders = tasks.map((t, i) => {
        const offset = i * 9;
        values.push(
            t.id, t.tenant, t.title, t.content, t.created_by,
            t.created_time, t.video_uid, t.video_duration, t.raw_media_url
        );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6}, $${offset+7}, $${offset+8}, $${offset+9}, NOW())`;
      }).join(', ');

      const query = `
        INSERT INTO video_labelling_tasks 
        (source_id, tenant, title, content, created_by, created_time, video_uid, video_duration, raw_media_url, upload_time)
        VALUES ${placeholders}
      `;

      await client.query(query, values);
      return res.status(200).json({ message: `Successfully uploaded ${tasks.length} tasks.` });
    }

    // --- GET: Fetch Next Task & Remaining Count ---
    if (req.method === 'GET') {
      const { username } = req.query;

      // 1. Fetch Next Task
      const taskQuery = `
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

      // 2. Count Remaining
      const countQuery = `
        SELECT COUNT(*) as remaining 
        FROM video_labelling_tasks 
        WHERE status IN ('pending', 'in_progress')
      `;

      const taskRes = await client.query(taskQuery, [username]);
      const countRes = await client.query(countQuery);

      return res.status(200).json({ 
        task: taskRes.rows[0] || null,
        remaining: parseInt(countRes.rows[0].remaining) || 0
      });
    }

    // --- PUT: Submit Label (FIXED: Restored Time Calculations) ---
    if (req.method === 'PUT') {
      try {
        const { id, label, remarks } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: "Task ID is missing from request." });
        }

        // Added handling_time and turnaround_time calculations
        const query = `
            UPDATE video_labelling_tasks 
            SET status = 'completed', 
                label = $1, 
                remarks = $2, 
                updated_at = NOW(),
                handling_time = (NOW() - assigned_at),
                turnaround_time = (NOW() - upload_time)
            WHERE internal_id = $3
        `;
        
        const result = await client.query(query, [label, remarks, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Task ${id} not found or update failed.` });
        }

        return res.status(200).json({ success: true });
        
      } catch (putError) {
        console.error("Database Update Error:", putError);
        return res.status(500).json({ error: putError.message });
      }
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

    // --- DELETE: Export & Wipe ---
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

        const headers = [
          "id", "tenant", "title", "content", "created_by", 
          "created_time", "video_uid", "video_duration", "raw_media_url",
          "Moderation Label", "Moderation Remarks", "Moderated By", 
          "Task Assigned Time", "Task Completed Time", "Status",
          "Upload Time", "Handling Time", "Turnaround Time"
        ];
        
        let csv = headers.join(",") + "\n";
        
        rows.forEach(row => {
          const safe = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : "";
          const line = [
            row.source_id, row.tenant, row.title, row.content, row.created_by,
            row.created_time, row.video_uid, row.video_duration, row.raw_media_url,
            row.label, row.remarks, row.assigned_to, 
            row.assigned_at, row.updated_at, row.status,
            row.upload_time, row.handling_time, row.turnaround_time
          ].map(safe).join(",");
          csv += line + "\n";
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=moderation_export.csv');
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
