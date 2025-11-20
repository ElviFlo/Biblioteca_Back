import { db, nextId } from '../data/database.js';
import { createReservationModel } from '../models/reservationModel.js';
import { ApiError, handleError } from '../utils/errorResponse.js';

export async function reserveBook(req, res) {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = db.books.find(b => b.id === bookId && b.isActive);
    if (!book) throw new ApiError(404, 'Libro no encontrado');

    if (!book.available) {
      throw new ApiError(400, 'El libro ya está reservado');
    }

    const reservation = createReservationModel({ userId, bookId });
    reservation.id = nextId('reservation');

    db.reservations.push(reservation);
    book.available = false;
    book.updatedAt = new Date();

    res.status(201).json(reservation);
  } catch (error) {
    handleError(res, error);
  }
}

export async function returnBook(req, res) {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = db.books.find(b => b.id === bookId && b.isActive);
    if (!book) throw new ApiError(404, 'Libro no encontrado');

    const reservation = db.reservations.find(
      r => r.bookId === bookId && r.userId === userId && !r.returnedAt
    );
    if (!reservation) {
      throw new ApiError(400, 'No tienes este libro reservado');
    }

    reservation.returnedAt = new Date();

    book.available = true;
    book.updatedAt = new Date();

    res.json({ message: 'Libro devuelto correctamente', reservation });
  } catch (error) {
    handleError(res, error);
  }
}

export async function userReservations(req, res) {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && !req.user.permissions.canReadUsers) {
      throw new ApiError(403, 'No puedes ver este historial');
    }

    const reservations = db.reservations.filter(r => r.userId === userId);

    const result = reservations.map(r => {
      const book = db.books.find(b => b.id === r.bookId);
      return {
        id: r.id,
        bookId: r.bookId,
        bookTitle: book ? book.title : null,
        reservedAt: r.reservedAt,
        returnedAt: r.returnedAt
      };
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
}

export async function bookReservations(req, res) {
  try {
    const { bookId } = req.params;

    const reservations = db.reservations.filter(r => r.bookId === bookId);

    const result = reservations.map(r => {
      const user = db.users.find(u => u.id === r.userId);
      return {
        id: r.id,
        userId: r.userId,
        userName: user ? user.name : null,
        reservedAt: r.reservedAt,
        returnedAt: r.returnedAt
      };
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
}
