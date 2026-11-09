// Crea las tablas y la cuenta de prueba (contraseña guardada con hash bcrypt).
// Uso: npm run init-db
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db');

const user = process.env.ADMIN_USER;
const pass = process.env.ADMIN_PASSWORD;
if (!user || !pass) {
  console.error('Falta ADMIN_USER o ADMIN_PASSWORD en el archivo .env');
  process.exit(1);
}

db.exec(fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8'));

const hash = bcrypt.hashSync(pass, 10);
db.prepare(
  `INSERT INTO usuarios (username, password_hash) VALUES (?, ?)
   ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash`
).run(user, hash);

console.log(`Base de datos lista. Cuenta de prueba: "${user}" (contraseña almacenada con hash).`);
