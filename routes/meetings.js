const express = require('express');
const { createMeeting, getMeetings, getMeetingById, editMeeting, deleteMeeting } = require('../database/meetings.db.js'); // Import the functions
const { getAbsenceRequestsByMeetingId, processAbsenceRequest } = require('../database/absenceRequests.db.js'); // Import the functions to handle absence requests
const multer = require('multer');
const router = express.Router();
const upload = multer();
const authenticate = require('../middleware/authenticate');
const { authorizeAdmin, authorizePengurus, authorizeSiswa } = require('../middleware/authorize');

// Meeting Schedules
router.get('/', authenticate, authorizeAdmin, authorizePengurus,  async (req, res) => {
    try {
        const meetings = await getMeetings();
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving meetings: ${err.message}` });
    }
});

// Create a new meeting
router.post('/', authenticate, authorizeAdmin, authorizePengurus, upload.none(), async (req, res) => {
    try {
        const { title, description, date, start_time, end_time } = req.body;
        const newMeeting = await createMeeting(title, description, date, start_time, end_time);
        res.status(201).json(newMeeting);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error creating meeting: ${err.message}` });
    }
});

// Get a single meeting
router.get('/:id', authenticate, authorizeAdmin, authorizePengurus,  async (req, res) => {
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
router.put('/:id', authenticate, authorizeAdmin, authorizePengurus, upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, start_time, end_time } = req.body;
        const editedMeeting = await editMeeting(id, title, description, date, start_time, end_time);
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
router.delete('/:id', authenticate, authorizeAdmin, authorizePengurus,  async (req, res) => {
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

// Get absence requests for a specific meeting
router.get('/:id/absence-requests', authenticate, authorizeAdmin,  async (req, res) => {
    try {
        const { id } = req.params;
        const absenceRequests = await getAbsenceRequestsByMeetingId(id);
        res.json(absenceRequests);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving absence requests: ${err.message}` });
    }
});

// Process an absence request
router.post('/:meetingId/absence-requests/:id', authenticate, authorizeAdmin,  upload.none(), async (req, res) => {
    try {
        const { meetingId, id } = req.params;
        const { state } = req.body;
        const processedRequest = await processAbsenceRequest(id, state);
        res.json(processedRequest);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error processing absence request: ${err.message}` });
    }
});


module.exports = router;