const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_osis',
  password: '',
  port: 5432,
}); 