import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/database.js';
import { config } from '../config/env.js';
import { ApiError, handleError } from '../utils/errorResponse.js';
import { requireFields } from '../utils/validators.js';

export async function login(req, res) {
  try {
    const errorMsg = requireFields(req.body, ['email', 'password']);
    if (errorMsg) {
      throw new ApiError(400, errorMsg);
    }

    const { email, password } = req.body;

    const user = db.users.find(u => u.email === email && u.isActive);
    if (!user) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: user.id, permissions: user.permissions },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        permissions: user.permissions
      }
    });
  } catch (error) {
    handleError(res, error);
  }
}
