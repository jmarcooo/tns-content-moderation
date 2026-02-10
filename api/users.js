import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

export default async function handler(request, response) {
  try {
    // --- GET: Fetch all users ---
    if (request.method === 'GET') {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      client.release();
      return response.status(200).json(rows);
    }

    // --- POST: Add a new user ---
    if (request.method === 'POST') {
      const { id, name, username, email, role, account_status, status, password, created_at } = request.body;
      const client = await pool.connect();
      await client.query(
        `INSERT INTO users (id, name, username, email, role, account_status, status, password, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, name, username, email, role, account_status, status, password, created_at]
      );
      client.release();
      return response.status(200).json({ message: 'User created' });
    }

    // --- PUT: Dynamic Update (Fixes Status Change) ---
    if (request.method === 'PUT') {
      const { id, ...updates } = request.body; // Separate ID from fields to update

      if (!id || Object.keys(updates).length === 0) {
        return response.status(400).json({ error: "Missing ID or update fields" });
      }

      // Dynamically build SQL query based on fields sent
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        // Allowed fields for security check
        if (['name', 'email', 'role', 'account_status', 'status', 'last_status_update'].includes(key)) {
            setClauses.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
      }

      values.push(id); // Add ID as the last parameter for WHERE clause

      const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;

      const client = await pool.connect();
      await client.query(query, values);
      client.release();

      return response.status(200).json({ message: 'User updated successfully' });
    }

    // --- DELETE: Remove a user ---
    if (request.method === 'DELETE') {
      const { id } = request.query;
      const client = await pool.connect();
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      client.release();
      return response.status(200).json({ message: 'User deleted' });
    }

  } catch (error) {
    console.error("Database Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
