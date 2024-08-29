const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_osis",
  password: "",
  port: 5432,
});

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Access denied.' });
  }
  next();
}

function authorizePengurus(req, res, next) {
  if (req.user.role !== 'pengurus') {
    return res.status(403).send({ error: 'Access denied.' });
  }
  next();
}

function authorizeSiswa(req, res, next) {
  if (req.user.role !== 'siswa') {
    return res.status(403).send({ error: 'Access denied.' });
  }
  next();
}

module.exports = {
  authorizeAdmin,
  authorizePengurus,
  authorizeSiswa,
};