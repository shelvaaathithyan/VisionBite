import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
  getPublicCustomerOrders,
  getUserMoodInsights,
  deleteAllOrders,
  deleteOrderById,
  clearAllOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public order creation (guest checkout supported)
router.post('/', createOrder);
router.get('/public/customer/:customerId', getPublicCustomerOrders);

// All other routes require authentication
router.use(protect);
router.get('/', getAllOrders);
router.delete('/', deleteAllOrders);
router.post('/clear-all', clearAllOrders);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/mood-insights', getUserMoodInsights);
router.get('/:id', getOrderById);
router.delete('/:id', deleteOrderById);
router.put('/:id/status', updateOrderStatus);

export default router;
