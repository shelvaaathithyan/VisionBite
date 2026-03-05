import express from 'express';
import {
  enrollCustomer,
  getAllCustomers,
  recognizeCustomer,
  getRecommendations,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer enrollment and management
router.post('/enroll', enrollCustomer);
router.get('/', getAllCustomers);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Face recognition
router.post('/recognize', recognizeCustomer);

// Recommendations
router.post('/recommendations', getRecommendations);

export default router;
