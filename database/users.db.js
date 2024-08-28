const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_osis",
  password: "",
  port: 5432,
});

async function createUser(
  username,
  password,
  role,
  name,
  email,
  phone,
  address,
  profile_pic
) {
  if (!username || !password || !role) {
    throw new Error("Username, password, and role are required");
  }

  const query = {
    text: `INSERT INTO users (username, password, role, name, email, phone, address, profile_pic) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    values: [
      username,
      password,
      role,
      name || null,
      email || null,
      phone || null,
      address || null,
      profile_pic || null,
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
    throw new Error("ID is required");
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

async function editUser(
  id,
  username,
  password,
  role,
  name,
  email,
  phone,
  address,
  profile_pic
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
      !profile_pic)
  ) {
    throw new Error(
      "ID is required and at least one of username, password, role, name, email, phone, address, or profile_pic must be provided"
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
  };

  const query = {
    text: `UPDATE users SET username = $1, password = $2, role = $3, name = $4, email = $5, phone = $6, address = $7, profile_pic = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *`,
    values: [
      updatedUser.username,
      updatedUser.password,
      updatedUser.role,
      updatedUser.name,
      updatedUser.email,
      updatedUser.phone,
      updatedUser.address,
      updatedUser.profile_pic,
      id,
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

async function deleteUser(id) {
  if (!id) {
    throw new Error("ID is required");
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  editUser,
  deleteUser,
};
