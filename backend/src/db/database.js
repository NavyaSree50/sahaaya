const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../sahaaya.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✅ SQLite Database initialized successfully with schema at:', dbPath);
}

module.exports = {
  db,
  initDb
};
