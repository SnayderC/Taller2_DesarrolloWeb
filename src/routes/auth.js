const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST /auth/login  (unica ruta publica)
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  const fila = db.prepare('SELECT id, username, password_hash FROM usuarios WHERE username = ?').get(username);
  // Se compara siempre contra un hash para no revelar si el usuario existe.
  const hash = fila ? fila.password_hash : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
  const ok = bcrypt.compareSync(password, hash) && !!fila;

  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  const token = jwt.sign({ sub: fila.id, username: fila.username }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn,
  });
  res.status(200).json({ token, tipo: 'Bearer', expira_en: expiresIn });
});

module.exports = router;
