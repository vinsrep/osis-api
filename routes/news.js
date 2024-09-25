const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllNews, getNewsById, updateNewsById, createNews, deleteNewsById } = require('../database/news.db');
const { authorizeRoles } = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');

// Configure multer fo uploads
const storage = multer.diskStorage({
    destination: function (req, cb) {
        cb(null, 'uploads/'); // Specify the destination directory
    },
    filename: function (req, cb) {
        cb(null, Date.now() + '-'.originalname); // Specify th naming convention
    }
});
const upload = multer({ storage: storage });

// Get all news articles
router.get('/', authenticate, authorizeRoles('admin', 'pengurus'), async (req, res) => {
    try {
        const news = await getAllNews();
        res.status(200).json(news);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Get a single news article by ID
router.get('/:id', authenticate, authorizeRoles('admin', 'pengurus'), async (req, res) => {
    const { id } = req.params;

    try {
        const news = await getNewsById(id);
        if (!news) {
            return res.status(404).send({ error: 'News article not found' });
        }
        res.status(200).json(news);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Create a news article
router.post('/', authenticate, authorizeRoles('admin', 'pengurus'), upload.none(), async (req, res) => {
    const { title, content } = req.body;
    const author_id = req.user.id;

    try {
        const newNews = await createNews(title, content, author_id);
        res.status(201).json(newNews);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Update a news article
router.put('/:id', authenticate, authorizeRoles('admin', 'pengurus'), upload.none(), async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const author_id = req.user.id;

    if (!title || !content) {
        return res.status(400).send({ error: 'Title and content are required.' });
    }

    try {
        console.log(`Updating news article with ID: ${id}, Title: ${title}, Content: ${content}, Author ID: ${author_id}`);
        const updatedNews = await updateNewsById(id, title, content, author_id);
        res.status(200).json(updatedNews);
    } catch (err) {
        console.error(err);
        if (err.message === 'Access denied.') {
            return res.status(403).send({ error: 'Access denied.' });
        }
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Delete a news article
router.delete('/:id', authenticate, authorizeRoles('admin', 'pengurus'), async (req, res) => {
    const { id } = req.params;
    const author_id = req.user.id;

    try {
        const deletedNews = await deleteNewsById(id, author_id);
        res.json({ message: "Article deleted" });
    } catch (err) {
        console.error(err);
        if (err.message === 'Access denied.') {
            return res.status(403).send({ error: 'Access denied.' });
        }
        res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = router;