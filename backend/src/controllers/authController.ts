import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User.js';
import { generateToken } from '../utils/auth.js';
import { AppError } from '../utils/AppError.js';
import nodemailer from 'nodemailer';
import { uploadUserAvatar, getUserAvatarUrl, deleteUserAvatar } from '../middleware/upload.js';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'bug75297@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'mnrmfzetusdufgik'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Create fresh transporter for each email to avoid connection issues
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Generate verification code locally
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email locally
const sendVerificationEmailService = async (email: string, name: string, verificationCode: string): Promise<boolean> => {
  try {
    // Development mode - just log the email instead of sending
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log('📧 [DEV MODE] Verification Email:');
      console.log(`   To: ${email}`);
      console.log(`   Name: ${name}`);
      console.log(`   Verification Code: ${verificationCode}`);
      console.log(`   Subject: Welcome to CareConnect! Verify your account`);
      return true;
    }

    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - CareConnect',
      text: `Hi ${name}, Your verification code is: ${verificationCode}. This code expires in 10 minutes.`, // Plain text version
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              background-color: #f5f5f5; 
              line-height: 1.6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              border-radius: 8px; 
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center;
              margin-bottom: 30px;
            }
            .code-box { 
              background-color: #f8f9fa; 
              border: 1px solid #dee2e6; 
              border-radius: 5px; 
              padding: 20px; 
              margin: 20px 0; 
              font-size: 24px; 
              font-weight: bold; 
              color: #495057; 
              letter-spacing: 3px; 
              text-align: center;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #dee2e6; 
              text-align: center; 
              color: #6c757d; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="color: #495057; margin: 0;">Email Verification</h2>
              <p style="color: #6c757d; margin: 10px 0 0 0;">CareConnect Platform</p>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>Thank you for registering with CareConnect. To complete your account setup, please use the verification code below:</p>
            
            <div class="code-box">
              ${verificationCode}
            </div>
            
            <p>This verification code will expire in 10 minutes for security purposes.</p>
            
            <p>If you did not request this verification, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>CareConnect Team</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Add these headers to improve deliverability
      headers: {
        'X-Mailer': 'CareConnect Platform',
        'X-Priority': '3',
        'Importance': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@careconnect.com>',
        'List-Id': 'CareConnect Notifications <notifications.careconnect.com>'
      }
    };

    console.log(`📧 Attempting to send verification email to: ${email}`);
    const transporter = createTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to: ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    return false;
  }
};

// Send admin NGO notification locally
const sendAdminNGONotification = async (
  organizationName: string,
  ngoEmail: string,
  organizationType: string
): Promise<boolean> => {
  try {
    // Development mode - just log the notification instead of sending
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log('📧 [DEV MODE] Admin NGO Notification:');
      console.log(`   New NGO Registration: ${organizationName}`);
      console.log(`   Email: ${ngoEmail}`);
      console.log(`   Type: ${organizationType}`);
      return true;
    }
    
    console.log(`📧 Admin notification for NGO: ${organizationName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send admin notification:`, error);
    return false;
  }
};

interface AuthRequest extends Request {
  user?: IUser;
}

// Helper function to parse array fields that might come as JSON strings from FormData
const parseArrayField = (field: any): string[] | undefined => {
  if (!field) return undefined;
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch {
      return [field]; // If it's not JSON, treat as single string
    }
  }
  return undefined;
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      name,
      email,
      password,
      role,
      organizationName,
      organizationType,
      phone,
      skills,
      interests
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const userData: Partial<IUser> = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'volunteer',
      phone: phone?.trim(),
      isVerified: false,
      accountStatus: 'active'
    };

    // Add role-specific fields
    if (role === 'ngo_admin') {
      // Use organizationName if provided, otherwise use name as organization name
      userData.organizationName = organizationName?.trim() || name.trim();
      userData.organizationType = organizationType?.trim();
      userData.verificationStatus = 'pending'; // Explicitly set to pending
      userData.isNGOVerified = false;
      
      // Handle document uploads if files are provided
      const files = req.files as any;
      if (files) {
        userData.documents = {};
        
        if (files.registrationCert && files.registrationCert[0]) {
          userData.documents.registrationCertificate = {
            filename: files.registrationCert[0].filename,
            status: 'pending'
          };
        }
        
        if (files.taxExemption && files.taxExemption[0]) {
          userData.documents.taxExemptionCertificate = {
            filename: files.taxExemption[0].filename,
            status: 'pending'
          };
        }
        
        if (files.organizationalLicense && files.organizationalLicense[0]) {
          userData.documents.organizationalLicense = {
            filename: files.organizationalLicense[0].filename,
            status: 'pending'
          };
        }
        
        console.log('📄 Documents uploaded for NGO:', userData.documents);
      }
    } else if (role === 'volunteer') {
      // Handle skills and interests that may come as JSON strings from FormData
      userData.skills = parseArrayField(skills) || [];
      userData.interests = parseArrayField(interests) || [];
      userData.points = 0;
      userData.level = 1;
      userData.achievements = [];
      userData.verificationStatus = 'approved'; // Volunteers are auto-approved
    } else if (role === 'admin') {
      userData.verificationStatus = 'approved'; // Admins are auto-approved
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    console.log(`👤 User registered: ${user.email}, Role: ${user.role}, Verification Status: ${user.verificationStatus}`);

    // Send admin notification for new NGO registrations
    if (user.role === 'ngo_admin') {
      try {
        await sendAdminNGONotification(
          user.organizationName || user.name,
          user.email,
          user.organizationType || 'Not specified'
        );
        console.log(`📧 Admin notification sent for new NGO: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the registration if email sending fails
      }
    }

    // Send email verification only for volunteers, not for NGOs
    if (role === 'volunteer') {
      try {
        const verificationCode = generateVerificationCode();
        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.emailVerificationAttempts = 1;
        await user.save();

        await sendVerificationEmailService(user.email, user.name, verificationCode);
        console.log(`📧 Verification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the registration if email sending fails
      }
    } else if (role === 'ngo_admin') {
      // NGOs don't need email verification, just mark as verified
      user.isEmailVerified = true;
      await user.save();
      console.log(`✅ NGO email automatically verified: ${user.email}`);
    }

    // For NGO admins with pending status, don't auto-login
    if (user.role === 'ngo_admin' && user.verificationStatus === 'pending') {
      // Remove password from response
      const userResponse = user.toJSON();
      
      res.status(201).json({
        success: true,
        message: 'NGO registration submitted successfully. Please wait for admin approval before logging in.',
        data: {
          user: userResponse,
          // No token provided - user must wait for approval
          requiresApproval: true
        }
      });
      return;
    }

    // Generate JWT token for approved users (volunteers, admins, approved NGOs)
    const token = generateToken((user._id as any).toString());

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email (regardless of account status) and include password for comparison
    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if account is suspended
    if (user.accountStatus === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support for assistance.',
        code: 'ACCOUNT_SUSPENDED'
      });
      return;
    }

    // Check NGO verification status
    if (user.role === 'ngo_admin') {
      console.log(`🔍 NGO Login Check - User: ${user.email}, Status: ${user.verificationStatus}, NGO Verified: ${user.isNGOVerified}`);
      
      if (user.verificationStatus === 'pending') {
        // Check if NGO has any rejected documents that need resubmission
        const hasRejectedDocs = user.documents && (
          user.documents.registrationCertificate?.status === 'rejected' ||
          user.documents.taxExemptionCertificate?.status === 'rejected' ||
          user.documents.organizationalLicense?.status === 'rejected'
        );

        if (hasRejectedDocs) {
          console.log(`📋 NGO has rejected documents - allowing login but flagging for resubmission - ${user.email}`);
          
          // Update last active
          user.lastActive = new Date();
          await user.save();

          // Generate JWT token (allow login)
          const token = generateToken((user._id as any).toString());

          // Remove password from response
          const userResponse = user.toJSON();

          res.status(200).json({
            success: true,
            message: 'Login successful - Document resubmission required',
            code: 'DOCUMENTS_REJECTED',
            data: {
              user: userResponse,
              token,
              rejectedDocuments: {
                registrationCertificate: user.documents?.registrationCertificate?.status === 'rejected' ? {
                  status: 'rejected',
                  rejectionReason: user.documents.registrationCertificate.rejectionReason
                } : null,
                taxExemptionCertificate: user.documents?.taxExemptionCertificate?.status === 'rejected' ? {
                  status: 'rejected', 
                  rejectionReason: user.documents.taxExemptionCertificate.rejectionReason
                } : null,
                organizationalLicense: user.documents?.organizationalLicense?.status === 'rejected' ? {
                  status: 'rejected',
                  rejectionReason: user.documents.organizationalLicense.rejectionReason
                } : null
              }
            }
          });
          return;
        }

        console.log(`❌ NGO Login Blocked - Pending approval for ${user.email}`);
        res.status(403).json({
          success: false,
          message: 'Your NGO registration is pending approval from admin. Please wait for verification.',
          code: 'PENDING_APPROVAL',
          data: {
            organizationName: user.organizationName,
            email: user.email
          }
        });
        return;
      }
      if (user.verificationStatus === 'rejected') {
        console.log(`❌ NGO Login Blocked - Rejected for ${user.email}`);
        res.status(403).json({
          success: false,
          message: 'Your NGO registration has been rejected. Please contact support for more information.',
          code: 'REGISTRATION_REJECTED'
        });
        return;
      }
      console.log(`✅ NGO Login Allowed - Approved for ${user.email}`);
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken((user._id as any).toString());

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const {
      name,
      phone,
      location,
      skills,
      interests,
      availability,
      organizationName,
      organizationType,
      website,
      description,
      foundedYear
    } = req.body;

    // Handle avatar upload - check both possible field names
    const uploadedFile = req.files && (
      (req.files as any).avatar?.[0] || 
      (req.files as any).profilePicture?.[0]
    );
    
    if (uploadedFile) {
      // Delete old avatar if exists
      if (user.profilePicture) {
        const oldAvatarFilename = user.profilePicture.split('/').pop();
        if (oldAvatarFilename) {
          deleteUserAvatar(oldAvatarFilename);
        }
      }
      // Set new avatar URL
      user.profilePicture = getUserAvatarUrl(uploadedFile.filename);
    }

    // Update basic fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (location) user.location = location;

    // Update role-specific fields
    if (user.role === 'volunteer') {
      if (skills) user.skills = skills;
      if (interests) user.interests = interests;
      if (availability) user.availability = availability;
    } else if (user.role === 'ngo_admin') {
      if (organizationName) user.organizationName = organizationName.trim();
      if (organizationType) user.organizationType = organizationType.trim();
      if (website) user.website = website.trim();
      if (description) user.description = description.trim();
      if (foundedYear) user.foundedYear = foundedYear;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    userWithPassword.password = hashedNewPassword;
    await userWithPassword.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For JWT-based auth, logout is typically handled on the client side
    // by removing the token. Here we can update the last active time.
    
    if (req.user) {
      req.user.lastActive = new Date();
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Resubmit documents for rejected NGO
export const resubmitDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get email from request body since user might not be authenticated
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required for document resubmission'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'ngo_admin') {
      res.status(404).json({
        success: false,
        message: 'NGO admin not found'
      });
      return;
    }

    // Handle document uploads if files are provided
    const files = req.files as any;
    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No documents provided for resubmission'
      });
      return;
    }

    // Update only the rejected documents with new files
    if (!user.documents) {
      user.documents = {};
    }

    let documentsUpdated = 0;

    if (files.registrationCert && files.registrationCert[0]) {
      user.documents.registrationCertificate = {
        filename: files.registrationCert[0].filename,
        status: 'pending',
        rejectionReason: undefined
      };
      documentsUpdated++;
    }

    if (files.taxExemption && files.taxExemption[0]) {
      user.documents.taxExemptionCertificate = {
        filename: files.taxExemption[0].filename,
        status: 'pending',
        rejectionReason: undefined
      };
      documentsUpdated++;
    }

    if (files.organizationalLicense && files.organizationalLicense[0]) {
      user.documents.organizationalLicense = {
        filename: files.organizationalLicense[0].filename,
        status: 'pending',
        rejectionReason: undefined
      };
      documentsUpdated++;
    }

    if (documentsUpdated === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid documents were uploaded'
      });
      return;
    }

    // Reset NGO status to pending since new documents are submitted
    user.verificationStatus = 'pending';
    user.isNGOVerified = false;
    user.rejectionReason = undefined;

    await user.save();

    console.log(`📄 Documents resubmitted for NGO: ${user.email}, Documents updated: ${documentsUpdated}`);

    res.status(200).json({
      success: true,
      message: `Successfully resubmitted ${documentsUpdated} document(s). Your application is now under review.`,
      data: {
        documentsUpdated,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('Error resubmitting documents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Email Verification Functions
export const sendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Check if user has exceeded verification attempts
    if (user.emailVerificationAttempts >= 5) {
      res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please contact support.'
      });
      return;
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.emailVerificationAttempts += 1;

    await user.save();

    // Send verification email
    await sendVerificationEmailService(email, user.name, verificationCode);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      data: {
        attemptsRemaining: 5 - user.emailVerificationAttempts
      }
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Check if user has exceeded verification attempts
    if (user.emailVerificationAttempts >= 5) {
      res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please contact support.'
      });
      return;
    }

    // Check if last verification code was sent recently (rate limiting)
    if (user.emailVerificationExpires && user.emailVerificationExpires > new Date(Date.now() - 2 * 60 * 1000)) {
      res.status(429).json({
        success: false,
        message: 'Please wait at least 2 minutes before requesting a new code'
      });
      return;
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.emailVerificationAttempts += 1;

    await user.save();

    // Send verification email
    await sendVerificationEmailService(email, user.name, verificationCode);

    res.status(200).json({
      success: true,
      message: 'New verification code sent successfully',
      data: {
        attemptsRemaining: 5 - user.emailVerificationAttempts
      }
    });

  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code'
    });
  }
};

// Verify email with code
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Check if verification code is expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
      return;
    }

    // Check verification code
    if (user.emailVerificationCode !== verificationCode) {
      // Increment failed attempts
      user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
      await user.save();

      res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        data: {
          attemptsRemaining: Math.max(0, 5 - user.emailVerificationAttempts)
        }
      });
      return;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email: string, resetCode: string) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'CareConnect',
      address: emailConfig.auth.user
    },
    to: email,
    subject: 'Password Reset Code - CareConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code - CareConnect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Code</h1>
          <p>CareConnect - Connecting Hearts, Changing Lives</p>
        </div>
        
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your CareConnect account. Use the verification code below to reset your password:</p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 16px; color: #666;">Your Reset Code</p>
            <div class="code">${resetCode}</div>
            <p style="margin: 0; font-size: 14px; color: #666; margin-top: 10px;">Enter this code on the reset password page</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul>
              <li>This code will expire in <strong>15 minutes</strong> for your security</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this code with anyone</li>
              <li>If you're concerned about your account security, contact our support team</li>
            </ul>
          </div>
          
          <p><strong>How to use this code:</strong></p>
          <ol>
            <li>Go back to the password reset page</li>
            <li>Enter this 6-digit code</li>
            <li>Set your new password</li>
            <li>Log in with your new credentials</li>
          </ol>
          
          <p>Best regards,<br>The CareConnect Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from CareConnect. If you have any questions, please contact our support team.</p>
          <p>© 2025 CareConnect. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'X-Mailer': 'CareConnect-System',
      'Reply-To': emailConfig.auth.user
    }
  };

  await transporter.sendMail(mailOptions);
};

// Forgot password controller
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
      return;
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set code and expiration (15 minutes from now)
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await user.save();

    // Send email with reset code
    try {
      await sendPasswordResetEmail(user.email, resetCode);
      console.log(`📧 Password reset code sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Clear the reset code since email failed
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Reset password controller
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, password } = req.body;

    if (!code || !password) {
      res.status(400).json({
        success: false,
        message: 'Verification code and password are required'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Find user with valid reset code
    const user = await User.findOne({
      passwordResetCode: code,
      passwordResetExpires: { $gt: new Date() }
    }).select('+password');

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset code
    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    console.log(`🔐 Password reset successful for ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};
