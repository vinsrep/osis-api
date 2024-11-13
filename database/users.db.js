const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getUsers() {
  const query = {
    text: `SELECT * FROM users WHERE deleted_at IS NULL`,
  };
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}


async function getUserByUsername(username) {
  if (!username) {
    throw new Error("Username is required");
  }

  const query = {
    text: `SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL`,
    values: [username],
  };
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function createUser(
  username,
  password,
  role,
  name,
  email,
  phone,
  address,
  profile_pic,
  angkatan,
  div
) {
  if (!username || !password || !role) {
    throw new Error("Username, password, and role are required");
  }

  const query = {
    text: `INSERT INTO users (username, password, role, name, email, phone, address, profile_pic, angkatan, div) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    values: [
      username,
      password,
      role,
      name || null,
      email || null,
      phone || null,
      address || null,
      profile_pic || null,
      angkatan || null,
      div || null,
    ],
  };
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function editUser(
  id,
  username,
  password,
  role,
  name,
  email,
  phone,
  address,
  profile_pic,
  angkatan,
  div
) {
  if (
    !id ||
    (!username &&
      !password &&
      !role &&
      !name &&
      !email &&
      !phone &&
      !address &&
      !profile_pic &&
      !angkatan &&
      !div)
  ) {
    throw new Error(
      "ID is required and at least one of username, password, role, name, email, phone, address, profile_pic, angkatan, or div must be provided"
    );
  }

  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const updatedUser = {
    username: username || existingUser.username,
    password: password || existingUser.password,
    role: role || existingUser.role,
    name: name || existingUser.name,
    email: email || existingUser.email,
    phone: phone || existingUser.phone,
    address: address || existingUser.address,
    profile_pic: profile_pic || existingUser.profile_pic,
    angkatan: angkatan || existingUser.angkatan,
    div: div || existingUser.div,
  };

  const query = {
    text: `UPDATE users SET username = $1, password = $2, role = $3, name = $4, email = $5, phone = $6, address = $7, profile_pic = $8, angkatan = $9, div = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *`,
    values: [
      updatedUser.username,
      updatedUser.password,
      updatedUser.role,
      updatedUser.name,
      updatedUser.email,
      updatedUser.phone,
      updatedUser.address,
      updatedUser.profile_pic,
      updatedUser.angkatan,
      updatedUser.div,
      id,
    ],
  };
  try {
    const result = await pool.query(query);

    // Delete the old profile picture if a new one is provided
    if (profile_pic && existingUser.profile_pic && profile_pic !== existingUser.profile_pic) {
      const oldProfilePicPath = path.join(__dirname, '..', existingUser.profile_pic);
      fs.unlink(oldProfilePicPath, (err) => {
        if (err) {
          console.error(`Error deleting old profile picture: ${err.message}`);
        } else {
          console.log(`Old profile picture deleted: ${oldProfilePicPath}`);
        }
      });
    }

    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUserById(id) {
  if (!id) {
    throw new Error("ID is required");
  }

  const query = {
    text: `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
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

async function deleteUser(id) {
  if (!id) {
    throw new Error("ID is required");
  }

  // Fetch the user's profile picture path
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }

  const profilePicPath = user.profile_pic;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Soft delete the user by setting the deleted_at column
    const deleteUserQuery = {
      text: `UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      values: [id],
    };
    await client.query(deleteUserQuery);

    // Delete the profile picture if it exists
    if (profilePicPath) {
      const filePath = path.join(__dirname, '..', profilePicPath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting profile picture: ${err.message}`);
        } else {
          console.log(`Profile picture deleted: ${filePath}`);
        }
      });
    }

    await client.query('COMMIT');
    return "User has been soft deleted.";
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  editUser,
  deleteUser,
  getUserByUsername,
};