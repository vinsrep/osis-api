const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to get attendances by meeting schedule ID
async function getAttendancesByMeetingScheduleId(meetingScheduleId) {
  const query = `
    SELECT * FROM attendances
    WHERE meeting_schedule_id = $1
  `;
  const values = [meetingScheduleId];
  const res = await pool.query(query, values);
  return res.rows;
}

// Function to get meeting schedule details along with attendances
async function getMeetingScheduleWithAttendances(meetingScheduleId) {
  const meetingScheduleQuery = `
    SELECT * FROM meeting_schedules
    WHERE id = $1
  `;
  const meetingScheduleValues = [meetingScheduleId];
  const meetingScheduleRes = await pool.query(meetingScheduleQuery, meetingScheduleValues);
  const meetingSchedule = meetingScheduleRes.rows[0];

  if (!meetingSchedule) {
    throw new Error('Meeting schedule not found');
  }

  const attendances = await getAttendancesByMeetingScheduleId(meetingScheduleId);

  return {
    ...meetingSchedule,
    attendances,
  };
}

// // Example usage
// getMeetingScheduleWithAttendances(1)
//   .then(data => console.log(data))
//   .catch(err => console.error(err));


// Function to get all attendances
async function getAttendances() {
  const query = `
        SELECT * FROM attendances
    `;
  const res = await pool.query(query);
  return res.rows;
}

// Function to create a new attendance record
async function createAttendance(userId, meetingScheduleId, status, note) {
  const query = `
      INSERT INTO attendances (user_id, meeting_schedule_id, status, note)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
  const values = [userId, meetingScheduleId, status, note];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// Function to get an attendance record by ID
async function getAttendanceById(attendanceId) {
  const query = `
      SELECT * FROM attendances
      WHERE id = $1
    `;
  const values = [attendanceId];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// Function to update an attendance record by ID
async function editAttendanceById(id, user_id, meeting_schedule_id, status, note) {
  if (!id) {
    throw new Error("ID is required");
  }

  const existingAttendance = await getAttendanceById(id);
  if (!existingAttendance) {
    throw new Error("Attendance not found");
  }

  const updatedAttendance = {
    user_id: user_id !== undefined ? user_id : existingAttendance.user_id,
    meeting_schedule_id: meeting_schedule_id !== undefined ? meeting_schedule_id : existingAttendance.meeting_schedule_id,
    status: status !== undefined ? status : existingAttendance.status,
    note: note !== undefined ? note : existingAttendance.note,
  };

  const query = {
    text: `UPDATE attendances SET user_id = $1, meeting_schedule_id = $2, status = $3, note = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
    values: [
      updatedAttendance.user_id,
      updatedAttendance.meeting_schedule_id,
      updatedAttendance.status,
      updatedAttendance.note,
      id,
    ],
  };
  try {
    const result = await pool.query(query);

    // Update the joined attendance in meetings
    const updateMeetingQuery = {
      text: `UPDATE meeting_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      values: [updatedAttendance.meeting_schedule_id],
    };
    await pool.query(updateMeetingQuery);

    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Function to delete an attendance record by ID
async function deleteAttendanceById(attendanceId) {
  const query = `
      DELETE FROM attendances
      WHERE id = $1
    `;
  const values = [attendanceId];
  await pool.query(query, values);
  return { message: 'Attendance record deleted successfully' };
}

async function getAttendanceLogForAllUsers() {
  const query = {
    text: `
        SELECT 
          users.id AS user_id, 
          users.username AS user_name, 
          attendances.meeting_schedule_id, 
          attendances.status, 
          meeting_schedules.title AS meeting_title, 
          meeting_schedules.date AS meeting_date
        FROM 
          attendances
        JOIN 
          users ON attendances.user_id = users.id
        JOIN 
          meeting_schedules ON attendances.meeting_schedule_id = meeting_schedules.id
        ORDER BY 
          users.id, meeting_schedules.date
      `,
  };
  try {
    const result = await pool.query(query);
    const attendanceLog = result.rows.reduce((acc, row) => {
      const { user_id, user_name, meeting_schedule_id, status, meeting_title, meeting_date } = row;
      if (!acc[user_id]) {
        acc[user_id] = {
          user_id,
          user_name,
          attendances: []
        };
      }
      acc[user_id].attendances.push({
        meeting_schedule_id,
        status,
        meeting_title,
        meeting_date
      });
      return acc;
    }, {});

    return Object.values(attendanceLog);
  } catch (err) {
    console.error('Error retrieving attendance log:', err);
    throw new Error('Error retrieving attendance log');
  }
}


async function getAttendanceLogForUser(userId) {
  const query = {
    text: `
        SELECT 
          users.id AS user_id, 
          users.username AS user_name, 
          attendances.meeting_schedule_id, 
          attendances.status, 
          meeting_schedules.title AS meeting_title, 
          meeting_schedules.date AS meeting_date
        FROM 
          attendances
        JOIN 
          users ON attendances.user_id = users.id
        JOIN 
          meeting_schedules ON attendances.meeting_schedule_id = meeting_schedules.id
        WHERE 
          users.id = $1
        ORDER BY 
          meeting_schedules.date
      `,
    values: [userId],
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
  getAttendancesByMeetingScheduleId,
  getMeetingScheduleWithAttendances,
  getAttendances,
  createAttendance,
  getAttendanceById,
  editAttendanceById,
  deleteAttendanceById,
  getAttendanceLogForAllUsers,
  getAttendanceLogForUser,
};