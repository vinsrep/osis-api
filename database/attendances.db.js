const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
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

// Example usage
getMeetingScheduleWithAttendances(1)
  .then(data => console.log(data))
  .catch(err => console.error(err));


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
  async function editAttendanceById(attendanceId, status, note) {
    const query = `
      UPDATE attendances
      SET status = $2, note = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [attendanceId, status, note];
    const res = await pool.query(query, values);
    return res.rows[0];
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
  
  module.exports = {
    getAttendancesByMeetingScheduleId,
    getMeetingScheduleWithAttendances,
    getAttendances, 
    createAttendance,
    getAttendanceById,
    editAttendanceById,
    deleteAttendanceById,
  };