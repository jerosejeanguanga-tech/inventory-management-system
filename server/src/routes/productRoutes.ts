import express from 'express';
import {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, updateStock
} from '../config/productController';
import { authenticate as verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = express.Router();

router.get('/', verifyToken, getAllProducts);
router.get('/:id', verifyToken, getProductById);
router.post('/', verifyToken, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);
router.patch('/:id/stock', verifyToken, requireAdmin, updateStock);

export default router;