import { Router, Request, Response } from 'express';
import User from '../models/User.js';
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
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadNGODocuments, uploadUserAvatar } from '../middleware/upload.js';
import { validateSignup, validateLogin, validateUpdateProfile, validateChangePassword } from '../middleware/validation.js';

const router = Router();

// Public routes
router.post('/signup', uploadNGODocuments, validateSignup, signup);
router.post('/login', validateLogin, login);

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
router.put('/profile', uploadUserAvatar.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]), validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/logout', logout);

// Resubmit rejected documents
router.patch('/resubmit-documents', uploadNGODocuments, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email, role: 'ngo_admin' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let documentsUpdated = false;

    // Update rejected documents with new files
    if (files.registrationCert && user.documents?.registrationCertificate?.status === 'rejected') {
      user.documents.registrationCertificate.filename = files.registrationCert[0].filename;
      user.documents.registrationCertificate.status = 'pending';
      user.documents.registrationCertificate.rejectionReason = undefined;
      documentsUpdated = true;
    }

    if (files.taxExemption && user.documents?.taxExemptionCertificate?.status === 'rejected') {
      user.documents.taxExemptionCertificate.filename = files.taxExemption[0].filename;
      user.documents.taxExemptionCertificate.status = 'pending';
      user.documents.taxExemptionCertificate.rejectionReason = undefined;
      documentsUpdated = true;
    }

    if (files.organizationalLicense && user.documents?.organizationalLicense?.status === 'rejected') {
      user.documents.organizationalLicense.filename = files.organizationalLicense[0].filename;
      user.documents.organizationalLicense.status = 'pending';
      user.documents.organizationalLicense.rejectionReason = undefined;
      documentsUpdated = true;
    }

    if (!documentsUpdated) {
      return res.status(400).json({
        success: false,
        message: 'No rejected documents found to update'
      });
    }

    // Reset verification status to pending
    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Documents resubmitted successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          organizationName: user.organizationName,
          verificationStatus: user.verificationStatus
        }
      }
    });

  } catch (error) {
    console.error('Resubmit documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
