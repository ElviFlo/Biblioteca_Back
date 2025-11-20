import { registerUser } from '../src/controllers/userController.js';
import { db } from '../src/data/database.js';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.body = null;
  res.json = data => {
    res.body = data;
    return res;
  };
  return res;
}

describe('userController - registerUser', () => {
  beforeEach(() => {
    db.users.length = 0;
  });

  test('registro exitoso', async () => {
    const req = {
      body: {
        name: 'Alejandro',
        email: 'alejandro@example.com',
        password: '123456'
      }
    };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('alejandro@example.com');
    expect(db.users.length).toBe(1);
  });

  test('falla por campos faltantes', async () => {
    const req = {
      body: {
        email: 'alejandro@example.com',
        password: '123456'
      }
    };
    const res = mockRes();

    await registerUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
