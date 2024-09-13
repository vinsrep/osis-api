const express = require("express");
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');
const multer = require("multer");
const upload = multer().none();
const {
    getAbsenceRequests,
    getAbsenceRequestById,
    createAbsenceRequest,
    updateAbsenceRequest,
} = require("../database/absenceRequests.db");

// GET /absence-requests
router.get("/", authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
    try {
        const absenceRequests = await getAbsenceRequests();
        res.json(absenceRequests);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .send({ message: `Error retrieving absence requests: ${err.message}` });
    }
});

// GET /absence-requests/:id
router.get("/:id", authenticate, authorizeRoles('admin','pengurus'), async (req, res) => {
    try {
        const { id } = req.params;
        const absenceRequest = await getAbsenceRequestById(id);
        if (!absenceRequest) {
            res.status(404).send({ message: "Absence request not found" });
        } else {
            res.json(absenceRequest);
        }
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .send({ message: `Error retrieving absence request: ${err.message}` });
    }
});

// POST /absence-requests
router.post("/", authenticate, authorizeRoles('admin','pengurus'), upload, async (req, res) => {
    try {
        const { user_id, meeting_schedule_id, reason } = req.body;
        const newRequest = await createAbsenceRequest(
            user_id,
            meeting_schedule_id,
            reason
        );
        res.json(newRequest);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .send({ message: `Error creating absence request: ${err.message}` });
    }
});

// PUT /absence-requests/:id
router.put("/:id", authenticate, authorizeRoles('admin','pengurus'), upload, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const updatedRequest = await updateAbsenceRequest(id, reason);
        res.json(updatedRequest);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .send({ message: `Error updating absence request: ${err.message}` });
    }
});

module.exports = router;
