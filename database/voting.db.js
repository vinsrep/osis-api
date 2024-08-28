const { Pool } = require("pg");
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "db_osis",
    password: "",
    port: 5432,
});

async function createVotingTopic(title, description) {
    const query = {
        text: `INSERT INTO voting_topics (title, description) VALUES ($1, $2) RETURNING *`,
        values: [title, description],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getVotingTopics() {
    const query = {
        text: `SELECT * FROM voting_topics`,
    };
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getVotingTopicById(id) {
    const topicQuery = {
        text: `SELECT * FROM voting_topics WHERE id = $1`,
        values: [id],
    };
    const optionsQuery = {
        text: `SELECT * FROM voting_options WHERE voting_topic_id = $1`,
        values: [id],
    };
    try {
        const topicResult = await pool.query(topicQuery);
        const optionsResult = await pool.query(optionsQuery);
        const topic = topicResult.rows[0];
        const options = optionsResult.rows;
        return { ...topic, options };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function updateVotingTopic(id, title, description) {
    const query = {
        text: `UPDATE voting_topics SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        values: [title, description, id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function deleteVotingTopic(id) {
    const query = {
        text: `DELETE FROM voting_topics WHERE id = $1`,
        values: [id],
    };
    try {
        await pool.query(query);
        return "Topic has been deleted.";
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function createVotingOption(voting_topic_id, option, img) {
    if (!option) {
        throw new Error("Option is required");
    }
    const query = {
        text: `INSERT INTO voting_options (voting_topic_id, option, img) VALUES ($1, $2, $3) RETURNING *`,
        values: [voting_topic_id, option, img || null],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getVotingOptionsByTopicId(voting_topic_id) {
    const query = {
        text: `SELECT * FROM voting_options WHERE voting_topic_id = $1`,
        values: [voting_topic_id],
    };
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function deleteVotingOption(id) {
    const query = {
        text: `DELETE FROM voting_options WHERE id = $1`,
        values: [id],
    };
    try {
        await pool.query(query);
        return "Voting option deleted.";
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function submitVote(user_id, voting_topic_id, option_id) {
    const query = {
        text: `INSERT INTO votes (user_id, voting_topic_id, option_id) VALUES ($1, $2, $3) RETURNING *`,
        values: [user_id, voting_topic_id, option_id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function calculateVoteResults(voting_topic_id) {
    const query = {
        text: `
        WITH vote_counts AS (
          SELECT option_id, COUNT(*) AS count
          FROM votes
          WHERE voting_topic_id = $1
          GROUP BY option_id
        )
        INSERT INTO vote_results (voting_topic_id, option_id, count, percentage)
        SELECT $1, vc.option_id, vc.count, (vc.count::float / total_votes.total) * 100
        FROM vote_counts vc, (SELECT COUNT(*) AS total FROM votes WHERE voting_topic_id = $1) total_votes
        ON CONFLICT (voting_topic_id, option_id) DO UPDATE
        SET count = EXCLUDED.count, percentage = EXCLUDED.percentage, updated_at = CURRENT_TIMESTAMP
      `,
        values: [voting_topic_id],
    };
    try {
        await pool.query(query);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getVoteResultsByTopicId(voting_topic_id) {
    const query = {
        text: `
        SELECT vr.*, vo.option, vo.img
        FROM vote_results vr
        JOIN voting_options vo ON vr.option_id = vo.id
        WHERE vr.voting_topic_id = $1
      `,
        values: [voting_topic_id],
    };
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
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
    getVoteResultsByTopicId,
};

module.exports = {
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
    getVoteResultsByTopicId,
};
