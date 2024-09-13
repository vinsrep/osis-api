const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { createAttendance, getAttendances, getAttendanceById, editAttendance, deleteAttendance } = require('../database/attendances.db.js');
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');

// Attendance Schedules
router.get('/', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
    try {
        const attendances = await getAttendances();
        res.json(attendances);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving attendances: ${err.message}` });
    }
});

// Create a new attendance
router.post('/', authenticate, authorizeRoles('admin',), upload.none(), async (req, res) => {
    try {
        const { user_id, meeting_schedule_id, status, note } = req.body;
        const newAttendance = await createAttendance(user_id, meeting_schedule_id, status, note);
        res.status(201).json(newAttendance);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error creating attendance: ${err.message}` });
    }
});

// Get a single attendance
router.get('/:id', authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await getAttendanceById(id);
        if (!attendance) {
            res.status(404).send({ message: 'Attendance not found' });
        } else {
            res.json(attendance);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving attendance: ${err.message}` });
    }
});

// Edit an attendance
router.put('/:id', authenticate, authorizeRoles('admin',), upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, meeting_schedule_id, status, note } = req.body;
        const editedAttendance = await editAttendance(id, user_id, meeting_schedule_id, status, note);
        if (!editedAttendance) {
            res.status(404).send({ message: 'Attendance not found' });
        } else {
            res.json(editedAttendance);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error editing attendance: ${err.message}` });
    }
});

// Delete an attendance
router.delete('/:id', authenticate, authorizeRoles('admin',), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAttendance = await deleteAttendance(id);
        if (!deletedAttendance) {
            res.status(404).send({ message: 'Attendance not found' });
        } else {
            res.json({ message: 'Attendance deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error deleting attendance: ${err.message}` });
    }
});

module.exports = router;