import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../data/database.js';

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);

    const user = db.users.find(u => u.id === payload.id && u.isActive);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = user;
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
