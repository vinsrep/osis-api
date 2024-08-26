const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
}); 


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


module.exports = { createUser, getUsers };