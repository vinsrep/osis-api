const { Pool } = require('pg');
const { getAttendancesByMeetingScheduleId } = require('./attendances.db.js');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
}); 

async function getMeetings() {
  const query = {
    text: `SELECT * FROM meeting_schedules`,
  };
  try {
    const result = await pool.query(query);
    const meetings = result.rows;

    // Fetch attendances for each meeting schedule
    for (const meeting of meetings) {
      const attendances = await getAttendancesByMeetingScheduleId(meeting.id);
      meeting.attendances = attendances;
    }

    return meetings;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getMeetingById(id) {
  if (!id) {
    throw new Error('ID is required');
  }

  const query = {
    text: `SELECT * FROM meeting_schedules WHERE id = $1`,
    values: [id],
  };
  try {
    const result = await pool.query(query);
    const meeting = result.rows[0];

    if (meeting) {
      const attendances = await getAttendancesByMeetingScheduleId(meeting.id);
      meeting.attendances = attendances;
    }

    return meeting;
  } catch (err) {
    console.error(err);
    throw err;
  }
}


async function createMeeting(title, description, date, start_time, end_time) {
    if (!title || !description || !date || !start_time || !end_time) {
      throw new Error('Title, description, date, start_time, and end_time are required');
    }
  
    const query = {
      text: `INSERT INTO meeting_schedules (title, description, date, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [title, description, date, start_time, end_time],
    };
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


async function editMeeting(id, title, description, date, start_time, end_time) {
    if (!id || (!title && !description && !date && !start_time && !end_time)) {
        throw new Error('ID is required and at least one of title, description, date, start_time, or end_time must be provided');
    }

    const existingMeeting = await getMeetingById(id);
    if (!existingMeeting) {
        throw new Error('Meeting not found');
    }

    const updatedMeeting = {
        title: title || existingMeeting.title,
        description: description || existingMeeting.description,
        date: date || existingMeeting.date,
        start_time: start_time || existingMeeting.start_time,
        end_time: end_time || existingMeeting.end_time,
    };

    const query = {
        text: `UPDATE meeting_schedules SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5 WHERE id = $6 RETURNING *`,
        values: [updatedMeeting.title, updatedMeeting.description, updatedMeeting.date, updatedMeeting.start_time, updatedMeeting.end_time, id],
    };
    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function deleteMeeting(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const deleteAttendancesQuery = {
      text: `DELETE FROM attendances WHERE meeting_schedule_id = $1`,
      values: [id],
    };

    const deleteMeetingQuery = {
      text: `DELETE FROM meeting_schedules WHERE id = $1`,
      values: [id],
    };

    try {
      await pool.query('BEGIN');
      await pool.query(deleteAttendancesQuery);
      await pool.query(deleteMeetingQuery);
      await pool.query('COMMIT');
      return { message: 'Meeting and related attendances deleted successfully' };
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err);
      throw err;
    }
  }


module.exports = { createMeeting, getMeetings, getMeetingById, editMeeting, deleteMeeting };