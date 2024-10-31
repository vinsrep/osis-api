const express = require('express');
const router = express.Router();
const upload = require('../uploads/upload'); // Import the upload configuration
const bcrypt = require('bcrypt');
const saltRounds = 10;
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const {
  getAttendanceLogForAllUsers,
  getAttendanceLogForUser,
} = require('../database/attendances.db');
const {
  createUser,
  getUsers,
  getUserById,
  editUser,
  deleteUser,
} = require('../database/users.db');

// route to get attendance log for every user
router.get('/attendance-log', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
  try {
    const attendanceLog = await getAttendanceLogForAllUsers();
    res.json(attendanceLog);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error fetching attendance log: ${err.message}` });
  }
});

// route to get attendance log for a specific user
router.get('/:id/attendance-log', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
  try {
    const { id } = req.params;
    const attendanceLog = await getAttendanceLogForUser(id);
    res.json(attendanceLog);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error fetching attendance log: ${err.message}` });
  }
});

// GET the currently logged-in user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error fetching user: ${err.message}` });
  }
});

// GET all users
router.get('/', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error retrieving users: ${err.message}` });
  }
});

// GET /users/:id
router.get('/:id', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
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
router.post('/', upload.single('profile_pic'), async (req, res) => {
  try {
    const { username, password, role, name, email, phone, address, angkatan, div } = req.body;
    const profile_pic = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = await createUser(username, hashedPassword, role, name, email, phone, address, profile_pic, angkatan, div);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error creating user: ${err.message}` });
  }
});

// PUT /users/:id
router.put('/:id', upload.single('profile_pic'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, name, email, phone, address, angkatan, div } = req.body;
    const profile_pic = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    // Hash the password if it is provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }
    
    const updatedUser = await editUser(id, username, hashedPassword, role, name, email, phone, address, profile_pic, angkatan, div);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error updating user: ${err.message}` });
  }
});

// DELETE /users/:id
router.delete('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const message = await deleteUser(id);
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error deleting user: ${err.message}` });
  }
});

module.exports = router;