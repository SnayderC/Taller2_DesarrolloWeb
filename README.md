# 📚 Taller API REST – Libros

API REST con **Node.js + Express + SQLite + JWT** que permite crear, consultar, actualizar y eliminar libros. Todas las operaciones del CRUD están protegidas con un token JWT.

| | |
|---|---|
| **Autora** | Jenny Vásquez |
| **Entidad** | `libros` → `id`, `titulo`, `autor`, `anio`, `genero` |
| **Base de datos** | SQLite (archivo real `data/libros.db`, módulo `node:sqlite` incluido en Node.js) |
| **Autenticación** | JWT firmado con HS256 y vencimiento configurable (15 min por defecto) |
| **Requisitos** | Node.js **22.13 o superior**, Postman, un cliente SQLite (opcional) |

---

## 🚀 1. Instalación y ejecución

Ejecutar los comandos desde la carpeta del proyecto:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de configuración a partir de la plantilla
cp .env.example .env            # Windows: copy .env.example .env
```

Abrir `.env` y completar dos valores:

| Variable | Qué poner |
|---|---|
| `JWT_SECRET` | Un secreto largo y aleatorio. Generarlo con:<br>`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_PASSWORD` | La contraseña de la cuenta de prueba (la que se usará en Postman) |

```bash
# 3. Crear las tablas y la cuenta de prueba
npm run init-db

# 4. Encender la API
npm start
```

Debe aparecer:

```
API escuchando en http://localhost:3000
```

> ⚠️ **Dejar esa terminal abierta.** Si se cierra o se pulsa `Ctrl+C`, la API se apaga.

> ℹ️ Abrir `http://localhost:3000` en el navegador muestra `Cannot GET /`. Es normal: es una API sin interfaz gráfica y se prueba con Postman.

---

## 🔐 2. Cuenta de prueba (inicialización)

`npm run init-db` hace lo siguiente:

1. Ejecuta `sql/schema.sql`, que crea las tablas `usuarios` y `libros` si no existen.
2. Crea, o actualiza, el usuario definido en `ADMIN_USER` / `ADMIN_PASSWORD` del `.env`.
3. Guarda la contraseña **con hash bcrypt**, nunca en texto plano.

Se puede volver a ejecutar sin problema; si se cambia `ADMIN_PASSWORD`, actualiza el hash.

---

## 🎫 3. Obtener y usar el JWT

1. Enviar `POST /auth/login` con este body JSON:
   ```json
   { "username": "admin", "password": "<ADMIN_PASSWORD>" }
   ```
2. La respuesta trae el token:
   ```json
   { "token": "eyJhbGciOi...", "tipo": "Bearer", "expira_en": "15m" }
   ```
3. En cada petición a `/libros`, enviar el encabezado:
   ```
   Authorization: Bearer <token>
   ```

Si el token falta, es inválido o venció, la API responde **401** y no toca la base de datos.

---

## 🧪 4. Probar con Postman

### Preparación
1. Encender la API con `npm start`.
2. En Postman: **Import** → elegir `postman/Taller_API_Libros.postman_collection.json`.
3. Abrir la petición **1. Login válido** → pestaña **Body** → reemplazar `<contraseña de la cuenta de prueba>` por el valor de `ADMIN_PASSWORD` → **Save** (`Ctrl+S`).

La colección usa tres variables que se llenan solas:

| Variable | Valor |
|---|---|
| `{{baseUrl}}` | `http://localhost:3000` |
| `{{token}}` | Se guarda al ejecutar la petición 1 |
| `{{libroId}}` | Se guarda al ejecutar la petición 3 |

### Ejecutar en orden

| # | Petición | Esperado | Qué demuestra |
|---|---|---|---|
| 1 | `POST /auth/login` (credenciales válidas) | **200** | Emite el JWT |
| 2 | `POST /auth/login` (contraseña incorrecta) | **401** | Rechaza credenciales malas |
| 3 | `POST /libros` | **201** | Crea un registro |
| 4 | `GET /libros` | **200** | Lista los registros |
| 5 | `GET /libros/:id` | **200** | Consulta por identificador |
| 6 | `PUT /libros/:id` | **200** | Actualiza el campo `genero` |
| 7 | `POST /libros` sin `titulo` | **400** | Valida campos obligatorios |
| 8 | `GET /libros` sin token | **401** | Ruta protegida |
| 9 | `GET /libros` con token inválido | **401** | Verifica la firma |
| 10 | `DELETE /libros/:id` | **200** | Elimina el registro |
| 11 | `GET /libros/:id` (ya eliminado) | **404** | El registro ya no existe |

Cada petición tiene un test automático: en **Test Results** debe aparecer ✅ PASS.

### Prueba de persistencia (reiniciar el servidor)
Después de la petición **6**:
1. En la terminal de la API pulsar `Ctrl+C`.
2. Volver a ejecutar `npm start`.
3. En Postman ejecutar de nuevo la **5** → el libro sigue ahí con el cambio aplicado.

### Prueba con token vencido
1. En `.env` cambiar `JWT_EXPIRES_IN=15m` por `JWT_EXPIRES_IN=20s` y reiniciar la API.
2. Ejecutar la petición **1** y esperar más de 20 segundos.
3. Ejecutar cualquier petición del CRUD → **401** con `"error": "Token vencido"`.
4. Volver a poner `JWT_EXPIRES_IN=15m` y reiniciar.

---

## 🗄️ 5. Ver los cambios directamente en la base de datos

Una respuesta de Postman, por sí sola, no demuestra persistencia. Abrir `data/libros.db` con alguna de estas herramientas:

- **DB Browser for SQLite** (`sqlitebrowser`): pestaña *Execute SQL*.
- Extensión **SQLite Viewer** o **SQLite** de VS Code.
- Terminal: `sqlite3 data/libros.db`.

Y ejecutar:

```sql
SELECT * FROM libros;
```

Revisar la tabla después de **crear** (petición 3), **actualizar** (6) y **eliminar** (10). También se puede comprobar que la contraseña está hasheada:

```sql
SELECT id, username, password_hash FROM usuarios;
```

> 💡 En DB Browser, después de cada operación en Postman pulsar *Execute* otra vez para ver los datos actualizados.

---

## 📋 6. Rutas de la API

| Método y ruta | Descripción | JWT | Códigos |
|---|---|---|---|
| `POST /auth/login` | Valida credenciales y devuelve un JWT con vencimiento | No | 200, 400, 401 |
| `POST /libros` | Crea un libro (`titulo` y `autor` obligatorios) | Sí | 201, 400, 401 |
| `GET /libros` | Lista todos los libros | Sí | 200, 401 |
| `GET /libros/:id` | Consulta un libro | Sí | 200, 400, 401, 404 |
| `PUT /libros/:id` | Actualiza un libro | Sí | 200, 400, 401, 404 |
| `DELETE /libros/:id` | Elimina un libro | Sí | 200, 400, 401, 404 |

Campos de `libros`:

| Campo | Tipo | Obligatorio |
|---|---|---|
| `titulo` | texto | ✅ |
| `autor` | texto | ✅ |
| `anio` | entero | — |
| `genero` | texto | — |

Cualquier otro campo enviado en el body (por ejemplo `id`) se ignora.

---

## 🔄 7. Flujo de una petición protegida

```
Postman ──► POST /auth/login ──► bcrypt compara el hash ──► jwt.sign() ──► token
   │
   └──► GET /libros/5  +  Authorization: Bearer <token>
          │
          ▼
   src/app.js           app.use('/libros', verificarJWT, librosRoutes)
          │
          ▼
   src/middleware/auth.js   jwt.verify() comprueba firma y expiración
          │                  ├─ falla → 401 (el controlador nunca se ejecuta)
          ▼                  └─ ok → next()
   src/routes/libros.js     SELECT * FROM libros WHERE id = ?   (consulta parametrizada)
          │
          ▼
   data/libros.db  ──►  respuesta JSON (200 / 404)
```

---

## 📁 8. Estructura del proyecto

```
├── src/
│   ├── server.js              Arranque del servidor (puerto)
│   ├── app.js                 Express, JSON, rutas y manejo de errores
│   ├── db.js                  Conexión a SQLite
│   ├── middleware/
│   │   └── auth.js            Verificación del JWT (firma y expiración)
│   └── routes/
│       ├── auth.js            POST /auth/login
│       └── libros.js          CRUD con consultas parametrizadas
├── scripts/
│   └── init-db.js             Crea tablas y cuenta de prueba (hash bcrypt)
├── sql/
│   └── schema.sql             Script SQL de la base de datos
├── postman/
│   └── Taller_API_Libros.postman_collection.json
├── .env.example               Plantilla de variables (sin secretos)
├── package.json
└── package-lock.json
```

---

## 🛠️ 9. Solución de problemas

| Síntoma | Causa | Solución |
|---|---|---|
| Postman: `ECONNREFUSED 127.0.0.1:3000` | La API está apagada | Ejecutar `npm start` y dejar la terminal abierta |
| Navegador: `Cannot GET /` | No existe página de inicio | Normal; usar Postman |
| `401 Token requerido` | Falta el encabezado | Ejecutar primero la petición 1 |
| `401 Token vencido` | Pasaron más de 15 min | Ejecutar de nuevo la petición 1 |
| `401 Credenciales incorrectas` en la petición 1 | La contraseña del body no coincide | Usar el valor de `ADMIN_PASSWORD` o ejecutar `npm run init-db` otra vez |
| Peticiones 5, 6, 10 u 11 dan `404` | `libroId` vacío o el libro ya se eliminó | Ejecutar de nuevo la petición 3 |
| `Falta JWT_SECRET` al iniciar | No existe `.env` | `cp .env.example .env` y completarlo |
| `EADDRINUSE :3000` | El puerto ya está ocupado | Cerrar la otra terminal con la API o cambiar `PORT` en `.env` |
| `Cannot find module 'node:sqlite'` | Node.js muy antiguo | Instalar Node.js 22.13 o superior (`node -v`) |

---

## 📦 10. Clonar y ejecutar desde GitHub

```bash
git clone <url-del-repositorio>
cd <carpeta-del-repositorio>
npm install
cp .env.example .env     # completar JWT_SECRET y ADMIN_PASSWORD
npm run init-db
npm start
```

El repositorio **no** incluye `node_modules/`, `.env`, `data/` ni los archivos que Postman genera solo (`.postman/`, `postman/collections/`, `postman/globals/`), porque pueden guardar la contraseña o el token. Todo eso está en `.gitignore` y se regenera con los comandos de arriba.
