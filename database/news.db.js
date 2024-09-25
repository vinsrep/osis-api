const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function getAllNews() {
    const query = {
        text: `SELECT * FROM news ORDER BY created_at DESC`,
    };

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error');
    }
}

async function getNewsById(id) {
    const query = {
        text: `SELECT * FROM news WHERE id = $1`,
        values: [id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error');
    }
}

async function createNews(title, content, author_id) {
    const query = {
        text: `INSERT INTO news (title, content, author_id) VALUES ($1, $2, $3) RETURNING *`,
        values: [title, content, author_id],
    };

    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error');
    }
}

async function updateNewsById(id, title, content, author_id) {
    const checkQuery = {
        text: `SELECT * FROM news WHERE id = $1 AND author_id = $2`,
        values: [id, author_id],
    };

    try {
        const checkResult = await pool.query(checkQuery);
        if (checkResult.rows.length === 0) {
            throw new Error('Access denied.');
        }

        const updateQuery = {
            text: `UPDATE news SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
            values: [title, content, id],
        };

        const updateResult = await pool.query(updateQuery);
        return updateResult.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

async function deleteNewsById(id, author_id) {
    const checkQuery = {
        text: `SELECT * FROM news WHERE id = $1 AND author_id = $2`,
        values: [id, author_id],
    };

    try {
        const checkResult = await pool.query(checkQuery);
        if (checkResult.rows.length === 0) {
            throw new Error('Access denied.');
        }

        const deleteQuery = {
            text: `DELETE FROM news WHERE id = $1 RETURNING *`,
            values: [id],
        };

        const deleteResult = await pool.query(deleteQuery);
        return deleteResult.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNewsById,
    deleteNewsById,
};