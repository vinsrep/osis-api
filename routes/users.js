const express = require('express');
const router = express.Router();
const { createUser, getUsers, editUser, deleteUser, getUserById } = require('../database/users.db.js');
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

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error retrieving user: ${err.message}` });
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

// PUT /users/:id
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    const editedUser = await editUser(id, username, password, role);
    if (!editedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(editedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error editing user: ${err.message}` });
  }
});

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(deletedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error deleting user: ${err.message}` });
  }
});

module.exports = router;