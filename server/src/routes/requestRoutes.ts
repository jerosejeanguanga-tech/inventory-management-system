import express from 'express';
import {
  createRequest, getMyRequests,
  getAllRequests, updateRequestStatus, deleteRequest
} from '../controllers/requestController';
import { authenticate as verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/', verifyToken, createRequest);
router.get('/my', verifyToken, getMyRequests);
router.get('/', verifyToken, requireAdmin, getAllRequests);
router.patch('/:id/status', verifyToken, requireAdmin, updateRequestStatus);
router.delete('/:id', verifyToken, deleteRequest);

export default router;