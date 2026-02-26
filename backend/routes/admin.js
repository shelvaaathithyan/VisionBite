import express from 'express';
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getApprovedStaff,
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/pending-users', getPendingUsers);
router.get('/approved-staff', getApprovedStaff);
router.put('/approve/:id', approveUser);
router.put('/reject/:id', rejectUser);

export default router;
