require('dotenv').config();
const fs = require('fs');
const path = require('path');
// SQLite incluido en Node.js (>= 22.13): no requiere compilar nada.
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(process.env.DB_PATH || './data/libros.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

module.exports = db;
