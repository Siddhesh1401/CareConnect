import { Router } from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  resubmitDocuments,
  sendVerificationEmail,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { uploadNGODocuments } from '../middleware/upload';
import {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '../middleware/validation.js';

const router = Router();

// Public routes
router.post('/signup', uploadNGODocuments, validateSignup, signup);
router.post('/login', validateLogin, login);
router.patch('/resubmit-documents', uploadNGODocuments, resubmitDocuments);

// Email verification routes
router.post('/send-verification-email', sendVerificationEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/logout', logout);

export default router;
