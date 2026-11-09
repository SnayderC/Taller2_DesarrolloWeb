const jwt = require('jsonwebtoken');

// Verifica firma y expiracion del JWT ANTES de ejecutar cualquier controlador del CRUD.
module.exports = function verificarJWT(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido (Authorization: Bearer <token>)' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ error: mensaje });
  }
};
