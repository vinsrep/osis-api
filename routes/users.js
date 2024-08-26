const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../database/users.db.js');
const multer = require('multer');
const upload = multer();

// GET /users
router.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error retrieving users: ${err.message}` });
  }
});

// POST /users
router.post('/', upload.none(), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const newUser = await createUser(username, password, role);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error creating user: ${err.message}` });
  }
});
module.exports = router;