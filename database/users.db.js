const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
}); 

async function getUsers() {
  const query = {
    text: `SELECT * FROM users`,
  };
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUserById(id) {
    if (!id) {
        throw new Error('ID is required');
    }

    const query = {
        text: `SELECT * FROM users WHERE id = $1`,
        values: [id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function createUser(username, password, role) {
    if (!username || !password || !role) {
      throw new Error('Username, password, and role are required');
    }
  
    const query = {
      text: `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *`,
      values: [username, password, role],
    };
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


async function editUser(id, username, password, role) {
    if (!id || (!username && !password && !role)) {
        throw new Error('ID is required and at least one of username, password, or role must be provided');
    }

    const existingUser = await getUserById(id);
    if (!existingUser) {
        throw new Error('User not found');
    }

    const updatedUser = {
        username: username || existingUser.username,
        password: password || existingUser.password,
        role: role || existingUser.role,
    };

    const query = {
        text: `UPDATE users SET username = $1, password = $2, role = $3 WHERE id = $4 RETURNING *`,
        values: [updatedUser.username, updatedUser.password, updatedUser.role, id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function deleteUser(id) {
    if (!id) {
        throw new Error('ID is required');
    }

    const query = {
        text: `DELETE FROM users WHERE id = $1`,
        values: [id],
    };
    try {
        await pool.query(query);
        return "User has been deleted.";
    } catch (err) {
        console.error(err);
        throw err;
    }
}


module.exports = { createUser, getUsers, getUserById, editUser, deleteUser };