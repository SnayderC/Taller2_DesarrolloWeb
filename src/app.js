require('dotenv').config();
const express = require('express');
const verificarJWT = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const librosRoutes = require('./routes/libros');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Ruta publica
app.use('/auth', authRoutes);

// Rutas protegidas: el middleware se ejecuta antes que cualquier controlador
app.use('/libros', verificarJWT, librosRoutes);

// JSON malformado y errores generales
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
