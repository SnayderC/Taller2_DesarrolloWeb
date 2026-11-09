-- Esquema de la base de datos (SQLite). Entidad elegida: libros.
-- Se ejecuta automaticamente con: npm run init-db

CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS libros (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo     TEXT    NOT NULL,
  autor      TEXT    NOT NULL,
  anio       INTEGER,
  genero     TEXT,
  creado_en  TEXT    NOT NULL DEFAULT (datetime('now'))
);
