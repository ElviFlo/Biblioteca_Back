import { Router } from 'express';
import {
  reserveBook,
  returnBook,
  userReservations,
  bookReservations
} from '../controllers/reservationController.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/books/:bookId/reserve', authRequired, reserveBook);
router.post('/books/:bookId/return', authRequired, returnBook);
router.get('/users/:userId', authRequired, userReservations);
router.get('/books/:bookId', authRequired, bookReservations);

export default router;
