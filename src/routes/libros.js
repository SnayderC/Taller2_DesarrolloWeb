const express = require('express');
const db = require('../db');

const router = express.Router();

// Solo se aceptan estos campos (lista blanca).
function validar(body, { parcial = false } = {}) {
  const errores = [];
  const b = body || {};
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : b.titulo;
  const autor = typeof b.autor === 'string' ? b.autor.trim() : b.autor;

  if (typeof titulo !== 'string' || !titulo) errores.push('titulo es obligatorio (texto)');
  if (typeof autor !== 'string' || !autor) errores.push('autor es obligatorio (texto)');
  if (b.anio !== undefined && b.anio !== null && !Number.isInteger(b.anio)) errores.push('anio debe ser un entero');
  if (b.genero !== undefined && b.genero !== null && typeof b.genero !== 'string') errores.push('genero debe ser texto');

  return {
    errores,
    datos: { titulo, autor, anio: b.anio ?? null, genero: b.genero ?? null },
  };
}

function idValido(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo' });
    return null;
  }
  return id;
}

// POST /libros
router.post('/', (req, res) => {
  const { errores, datos } = validar(req.body);
  if (errores.length) return res.status(400).json({ errores });

  const info = db
    .prepare('INSERT INTO libros (titulo, autor, anio, genero) VALUES (?, ?, ?, ?)')
    .run(datos.titulo, datos.autor, datos.anio, datos.genero);
  const libro = db.prepare('SELECT * FROM libros WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(libro);
});

// GET /libros
router.get('/', (req, res) => {
  res.status(200).json(db.prepare('SELECT * FROM libros ORDER BY id').all());
});

// GET /libros/:id
router.get('/:id', (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;
  const libro = db.prepare('SELECT * FROM libros WHERE id = ?').get(id);
  if (!libro) return res.status(404).json({ error: `No existe el libro con id ${id}` });
  res.status(200).json(libro);
});

// PUT /libros/:id
router.put('/:id', (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;

  const { errores, datos } = validar(req.body);
  if (errores.length) return res.status(400).json({ errores });

  const info = db
    .prepare('UPDATE libros SET titulo = ?, autor = ?, anio = ?, genero = ? WHERE id = ?')
    .run(datos.titulo, datos.autor, datos.anio, datos.genero, id);
  if (info.changes === 0) return res.status(404).json({ error: `No existe el libro con id ${id}` });

  res.status(200).json(db.prepare('SELECT * FROM libros WHERE id = ?').get(id));
});

// DELETE /libros/:id
router.delete('/:id', (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;
  const info = db.prepare('DELETE FROM libros WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: `No existe el libro con id ${id}` });
  res.status(200).json({ mensaje: `Libro ${id} eliminado` });
});

module.exports = router;
