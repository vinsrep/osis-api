const express = require('express');
const { createMeeting, getMeetings, getMeetingById, editMeeting, deleteMeeting } = require('../database/meetings.db.js'); // Import the functions
const multer = require('multer');
const router = express.Router();
const upload = multer();

// Meeting Schedules
router.get('/', async (req, res) => {
    try {
        const meetings = await getMeetings();
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving meetings: ${err.message}` });
    }
});

// Create a new meeting
router.post('/', upload.none(), async (req, res) => {
    try {
        const { title, description, start_date, end_date, start_time, end_time } = req.body;
        const newMeeting = await createMeeting(title, description, start_date, end_date, start_time, end_time);
        res.status(201).json(newMeeting);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error creating meeting: ${err.message}` });
    }
});

// Get a single meeting
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await getMeetingById(id);
        if (!meeting) {
            res.status(404).send({ message: 'Meeting not found' });
        } else {
            res.json(meeting);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving meeting: ${err.message}` });
    }
});

// Edit a meeting
router.put('/:id', upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_date, end_date, start_time, end_time } = req.body;
        const editedMeeting = await editMeeting(id, title, description, start_date, end_date, start_time, end_time);
        if (!editedMeeting) {
            res.status(404).send({ message: 'Meeting not found' });
        } else {
            res.json(editedMeeting);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error editing meeting: ${err.message}` });
    }
});

// Delete a meeting
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMeeting = await deleteMeeting(id);
        if (!deletedMeeting) {
            res.status(404).send({ message: 'Meeting not found' });
        } else {
            res.json({ message: 'Meeting deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error deleting meeting: ${err.message}` });
    }
});

module.exports = router;