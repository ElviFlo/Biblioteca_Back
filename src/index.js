import express from 'express';
import bcrypt from 'bcryptjs';
import { db, nextId } from './data/database.js';
import { createUserModel } from './models/userModel.js';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const app = express();

app.use(express.json());

async function seedAdmin() {
  if (db.users.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = createUserModel({
      name: 'Admin',
      email: 'admin@biblio.com',
      passwordHash,
      permissions: {
        canCreateBook: true,
        canUpdateBook: true,
        canDeleteBook: true,
        canUpdateUser: true,
        canDeleteUser: true,
        canReadUsers: true
      }
    });
    admin.id = nextId('user');
    db.users.push(admin);

    console.log('Usuario admin creado: admin@biblio.com / admin123');
  }
}

seedAdmin();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reservations', reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.listen(config.port, () => {
  console.log(`Servidor escuchando en puerto ${config.port}`);
});
