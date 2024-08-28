const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const img = require('../uploads/upload');
const {
    createVotingTopic,
    getVotingTopics,
    getVotingTopicById,
    updateVotingTopic,
    deleteVotingTopic,
    createVotingOption,
    getVotingOptionsByTopicId,
    deleteVotingOption,
    submitVote,
    calculateVoteResults,
    getVoteResultsByTopicId
} = require('../database/voting.db');

// Create a new voting topic
router.post('/', upload.none(), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newTopic = await createVotingTopic(title, description);
        res.status(201).json(newTopic);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error creating voting topic: ${err.message}` });
    }
});

// Get all voting topics
router.get('/', async (req, res) => {
    try {
        const topics = await getVotingTopics();
        res.json(topics);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving voting topics: ${err.message}` });
    }
});

// Get a single voting topic by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await getVotingTopicById(id);
        res.json(topic);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving voting topic: ${err.message}` });
    }
});

// Update a voting topic
router.put('/:id', upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        await updateVotingTopic(id, title, description);
        res.json(updatedTopic);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error updating voting topic: ${err.message}` });
    }
});

// Delete a voting topic
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTopic = await deleteVotingTopic(id);
        if (!deletedTopic) {
            res.status(404).send({ message: 'Topic not found' });
        } else {
            res.json({ message: 'Voting topic deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error deleting voting topic: ${err.message}` });
    }
});

// Create a new voting option
router.post('/:topicId/options', img.single('img'), async (req, res) => {
    try {
        const { topicId } = req.params;
        const { option } = req.body;
        const img = req.file ? `/uploads/images/${req.file.filename}` : null;
        const newOption = await createVotingOption(topicId, option, img);
        res.json(newOption);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error creating voting option: ${err.message}` });
    }
});

// Get voting options for a specific topic
router.get('/:topicId/options', async (req, res) => {
    try {
        const { topicId } = req.params;
        const options = await getVotingOptionsByTopicId(topicId);
        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving voting options: ${err.message}` });
    }
});

// Delete a voting option
router.delete('/:topicId/options/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOption = await deleteVotingOption(id);
        if (!deletedOption) {
            res.status(404).send({ message: 'Option not found' });
        } else {
            res.json({ message: 'Voting option deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error deleting voting option: ${err.message}` });
    }
});

// Submit a vote
router.post('/:topicId/vote', upload.none(), async (req, res) => {
    try {
        const { topicId } = req.params;
        const { user_id, option_id } = req.body;
        const newVote = await submitVote(user_id, topicId, option_id);
        await calculateVoteResults(topicId); // Recalculate results after each vote
        res.status(201).json(newVote);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error submitting vote: ${err.message}` });
    }
});

// Get vote results for a specific topic
router.get('/:topicId/results', async (req, res) => {
    try {
        const { topicId } = req.params;
        const results = await getVoteResultsByTopicId(topicId);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error retrieving vote results: ${err.message}` });
    }
});

module.exports = router;