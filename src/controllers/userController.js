import bcrypt from 'bcryptjs';
import { db, nextId } from '../data/database.js';
import { createUserModel } from '../models/userModel.js';
import { ApiError, handleError } from '../utils/errorResponse.js';
import { requireFields } from '../utils/validators.js';

export async function registerUser(req, res) {
  try {
    const errorMsg = requireFields(req.body, ['name', 'email', 'password']);
    if (errorMsg) throw new ApiError(400, errorMsg);

    const { name, email, password, permissions } = req.body;

    const existing = db.users.find(u => u.email === email);
    if (existing) {
      throw new ApiError(400, 'El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUserModel({ name, email, passwordHash, permissions });
    user.id = nextId('user');

    db.users.push(user);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (req.user.id !== id && !req.user.permissions.canReadUsers) {
      throw new ApiError(403, 'No puedes ver este usuario');
    }

    const user = db.users.find(u => u.id === id && u.isActive);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const user = db.users.find(u => u.id === id && u.isActive);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    const isSelf = req.user.id === id;
    if (!isSelf && !req.user.permissions.canUpdateUser) {
      throw new ApiError(403, 'No puedes modificar este usuario');
    }

    const { name, email, password, permissions } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    if (permissions && req.user.permissions.canUpdateUser) {
      user.permissions = { ...user.permissions, ...permissions };
    }

    user.updatedAt = new Date();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function deactivateUser(req, res) {
  try {
    const { id } = req.params;

    const user = db.users.find(u => u.id === id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    const isSelf = req.user.id === id;
    if (!isSelf && !req.user.permissions.canDeleteUser) {
      throw new ApiError(403, 'No puedes inhabilitar este usuario');
    }

    user.isActive = false;
    user.updatedAt = new Date();

    res.json({ message: 'Usuario inhabilitado correctamente' });
  } catch (error) {
    handleError(res, error);
  }
}
