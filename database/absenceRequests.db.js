const { Pool } = require('pg');
const pool = new Pool({
 user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
});

async function getAbsenceRequests() {
    const query = {
        text: `SELECT * FROM absence_requests`,
    };
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getAbsenceRequestById(id) {
    const query = {
        text: `SELECT * FROM absence_requests WHERE id = $1`,
        values: [id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function createAbsenceRequest(user_id, meeting_schedule_id, reason) {
  const query = {
    text: `INSERT INTO absence_requests (user_id, meeting_schedule_id, reason) VALUES ($1, $2, $3) RETURNING *`,
    values: [user_id, meeting_schedule_id, reason],
  };
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateAbsenceRequest(id, reason) {
  const query = {
    text: `UPDATE absence_requests SET reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    values: [reason, id],
  };
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function processAbsenceRequest(id, state) {
    const query = {
        text: `SELECT * FROM absence_requests WHERE id = $1`,
        values: [id],
    };
    try {
        const result = await pool.query(query);
        const request = result.rows[0];
        if (!request) {
            throw new Error('Absence request not found');
        }
        if (state === 'rejected') {
            const updateQuery = {
                text: `UPDATE absence_requests SET state = 'rejected' WHERE id = $1 RETURNING *`,
                values: [id],
            };
            const updateResult = await pool.query(updateQuery);
            return updateResult.rows[0];
        } else if (state === 'accepted') {
            const updateQuery = {
                text: `UPDATE absence_requests SET state = 'accepted' WHERE id = $1 RETURNING *`,
                values: [id],
            };
            const updateResult = await pool.query(updateQuery);

            const attendanceQuery = {
                text: `INSERT INTO attendances (user_id, meeting_schedule_id, status, note) VALUES ($1, $2, 'izin', $3) RETURNING *`,
                values: [request.user_id, request.meeting_schedule_id, request.reason],
            };
            const attendanceResult = await pool.query(attendanceQuery);
            return attendanceResult.rows[0];
        } else {
            throw new Error('Invalid state');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getAbsenceRequestsByMeetingId(meeting_schedule_id) {
  const query = {
    text: `SELECT * FROM absence_requests WHERE meeting_schedule_id = $1`,
    values: [meeting_schedule_id],
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
  getAbsenceRequests,
  getAbsenceRequestById,
  createAbsenceRequest,
  updateAbsenceRequest,
  processAbsenceRequest,
  getAbsenceRequestsByMeetingId,
};