import bcrypt from 'bcryptjs';
import { login } from '../src/controllers/authController.js';
import { db, nextId } from '../src/data/database.js';
import { createUserModel } from '../src/models/userModel.js';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.json = data => {
    res.body = data;
    return res;
  };
  return res;
}

describe('authController - login', () => {
  beforeEach(() => {
    db.users.length = 0;
  });

  test('login exitoso con credenciales correctas', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const user = createUserModel({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash
    });
    user.id = nextId('user');
    db.users.push(user);

    const req = {
      body: {
        email: 'test@example.com',
        password: '123456'
      }
    };
    const res = mockRes();

    await login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  test('falla si faltan campos requeridos', async () => {
    const req = {
      body: {
        email: 'test@example.com'
      }
    };
    const res = mockRes();

    await login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
