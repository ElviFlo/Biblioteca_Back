import {
  reserveBook,
  returnBook,
  userReservations,
  bookReservations
} from '../src/controllers/reservationController.js';
import { db, nextId } from '../src/data/database.js';
import { createUserModel } from '../src/models/userModel.js';
import { createBookModel } from '../src/models/bookModel.js';
import { createReservationModel } from '../src/models/reservationModel.js';

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

describe('reservationController', () => {
  beforeEach(() => {
    db.users.length = 0;
    db.books.length = 0;
    db.reservations.length = 0;
  });

  function seedUser(id = null) {
    const user = createUserModel({
      name: 'Usuario',
      email: 'user@example.com',
      passwordHash: 'hash'
    });
    user.id = id || nextId('user');
    db.users.push(user);
    return user;
  }

  function seedBook({ title = 'Libro', available = true } = {}) {
    const book = createBookModel({
      title,
      author: 'Autor',
      genre: 'Género',
      publisher: 'Ed',
      publishDate: '2024-01-01',
      available
    });
    book.id = nextId('book');
    db.books.push(book);
    return book;
  }

  test('reserveBook - reserva exitosa', async () => {
    const user = seedUser('1');
    const book = seedBook({ title: 'Reservable', available: true });

    const req = {
      params: { bookId: book.id },
      user
    };
    const res = mockRes();

    await reserveBook(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(db.reservations.length).toBe(1);
    expect(book.available).toBe(false);
  });

  test('reserveBook - falla si el libro ya está reservado', async () => {
    const user = seedUser('1');
    const book = seedBook({ title: 'Ocupado', available: false });

    const req = {
      params: { bookId: book.id },
      user
    };
    const res = mockRes();

    await reserveBook(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returnBook - devolución exitosa', async () => {
    const user = seedUser('1');
    const book = seedBook({ title: 'Devuelto', available: false });

    const reservation = createReservationModel({
      userId: user.id,
      bookId: book.id
    });
    reservation.id = nextId('reservation');
    db.reservations.push(reservation);

    const req = {
      params: { bookId: book.id },
      user
    };
    const res = mockRes();

    await returnBook(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(reservation.returnedAt).not.toBeNull();
    expect(book.available).toBe(true);
  });

  test('returnBook - falla si el usuario no tiene reserva activa', async () => {
    const user = seedUser('1');
    const book = seedBook({ title: 'Sin reserva', available: true });

    const req = {
      params: { bookId: book.id },
      user
    };
    const res = mockRes();

    await returnBook(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('userReservations - historial de reservas de un usuario', async () => {
    const user = seedUser('1');
    const book1 = seedBook({ title: 'Libro 1', available: true });
    const book2 = seedBook({ title: 'Libro 2', available: true });

    const r1 = createReservationModel({ userId: user.id, bookId: book1.id });
    r1.id = nextId('reservation');
    const r2 = createReservationModel({ userId: user.id, bookId: book2.id });
    r2.id = nextId('reservation');

    db.reservations.push(r1, r2);

    const req = {
      params: { userId: user.id },
      user
    };
    const res = mockRes();

    await userReservations(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('bookTitle');
  });

  test('bookReservations - historial de reservas de un libro', async () => {
    const user = seedUser('1');
    const book = seedBook({ title: 'Libro Historial', available: true });

    const reservation = createReservationModel({
      userId: user.id,
      bookId: book.id
    });
    reservation.id = nextId('reservation');
    db.reservations.push(reservation);

    const req = {
      params: { bookId: book.id },
      user
    };
    const res = mockRes();

    await bookReservations(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('userName');
    expect(res.body[0].userName).toBe(user.name);
  });
});
