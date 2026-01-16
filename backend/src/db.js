const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const initDb = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDb
};
