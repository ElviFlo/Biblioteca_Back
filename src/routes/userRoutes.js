import { Router } from 'express';
import {
  registerUser,
  getUserById,
  updateUser,
  deactivateUser
} from '../controllers/userController.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', registerUser);
router.get('/:id', authRequired, getUserById);
router.put('/:id', authRequired, updateUser);
router.delete('/:id', authRequired, deactivateUser);

export default router;
