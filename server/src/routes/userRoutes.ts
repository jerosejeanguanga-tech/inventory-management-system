import express from 'express';
import {
  getProfile, updateProfile,
  getAllUsers, getDashboardStats
} from '../controllers/userController';
import { authenticate as verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profile_image'), updateProfile);
router.get('/', verifyToken, requireAdmin, getAllUsers);
router.get('/dashboard', verifyToken, requireAdmin, getDashboardStats);

export default router;