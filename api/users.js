import pg from 'pg';
const { Pool } = pg;

// Connect using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

export default async function handler(request, response) {
  try {
    // 1. GET: Fetch all users
    if (request.method === 'GET') {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      client.release();
      return response.status(200).json(rows);
    }

    // 2. POST: Add a new user
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

    // 3. PUT: Edit a user
    if (request.method === 'PUT') {
      const { id, name, email, role, account_status } = request.body;
      const client = await pool.connect();
      await client.query(
        `UPDATE users SET name = $1, email = $2, role = $3, account_status = $4 WHERE id = $5`,
        [name, email, role, account_status, id]
      );
      client.release();
      return response.status(200).json({ message: 'User updated' });
    }

    // 4. DELETE: Remove a user
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
