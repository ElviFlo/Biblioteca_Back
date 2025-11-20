import { Router } from 'express';
import {
  createBook,
  getBookById,
  listBooks,
  updateBook,
  deactivateBook
} from '../controllers/bookController.js';
import { authRequired } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = Router();

router.get('/', listBooks);
router.get('/:id', getBookById);
router.post(
  '/',
  authRequired,
  requirePermission('canCreateBook'),
  createBook
);
router.put(
  '/:id',
  authRequired,
  requirePermission('canUpdateBook'),
  updateBook
);
router.delete(
  '/:id',
  authRequired,
  requirePermission('canDeleteBook'),
  deactivateBook
);

export default router;
