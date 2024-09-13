const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_osis",
  password: "",
  port: 5432,
});

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    console.log('req.user:', req.user); // Add this line for debugging
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ error: 'Access denied.' });
    }
    next();
  };
}

module.exports = {
  authorizeRoles,
};