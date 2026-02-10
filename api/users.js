import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // 1. GET: Fetch all users
    if (request.method === 'GET') {
      const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      return response.status(200).json(rows);
    }

    // 2. POST: Add a new user
    if (request.method === 'POST') {
      const { id, name, username, email, role, account_status, status, password, created_at } = request.body;
      await sql`
        INSERT INTO users (id, name, username, email, role, account_status, status, password, created_at)
        VALUES (${id}, ${name}, ${username}, ${email}, ${role}, ${account_status}, ${status}, ${password}, ${created_at})
      `;
      return response.status(200).json({ message: 'User created' });
    }

    // 3. PUT: Edit a user
    if (request.method === 'PUT') {
      const { id, name, email, role, account_status } = request.body;
      await sql`
        UPDATE users 
        SET name = ${name}, email = ${email}, role = ${role}, account_status = ${account_status}
        WHERE id = ${id}
      `;
      return response.status(200).json({ message: 'User updated' });
    }

    // 4. DELETE: Remove a user
    if (request.method === 'DELETE') {
      const { id } = request.query;
      await sql`DELETE FROM users WHERE id = ${id}`;
      return response.status(200).json({ message: 'User deleted' });
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
