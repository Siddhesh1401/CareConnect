import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import nodemailer from 'nodemailer';

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
  },
  // Add these to improve deliverability
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
};

const transporter = nodemailer.createTransport(emailConfig);

// Send NGO status update email locally
const sendNGOStatusUpdate = async (
  email: string, 
  organizationName: string, 
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<boolean> => {
  try {
    // Development mode - just log the email instead of sending
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log('📧 [DEV MODE] NGO Status Update Email:');
      console.log(`   To: ${email}`);
      console.log(`   Organization: ${organizationName}`);
      console.log(`   Status: ${status}`);
      if (rejectionReason) console.log(`   Rejection Reason: ${rejectionReason}`);
      return true;
    }

    const isApproved = status === 'approved';
    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `NGO Registration ${isApproved ? 'Approved' : 'Status Update'} - ${organizationName}`,
      text: `Hello ${organizationName}, Your NGO registration status: ${status.toUpperCase()}. ${rejectionReason ? 'Reason: ' + rejectionReason : 'Please log in to your account for more details.'}`, // Plain text version
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NGO Registration Status</title>
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
            .status-approved { 
              background-color: #d4edda; 
              color: #155724; 
              border: 1px solid #c3e6cb;
            }
            .status-rejected { 
              background-color: #f8d7da; 
              color: #721c24; 
              border: 1px solid #f5c6cb;
            }
            .status-box { 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
              text-align: center;
              font-weight: bold;
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
              <h2 style="color: #495057; margin: 0;">NGO Registration Status Update</h2>
              <p style="color: #6c757d; margin: 10px 0 0 0;">CareConnect Platform</p>
            </div>
            
            <p>Hello ${organizationName},</p>
            
            <div class="status-box ${isApproved ? 'status-approved' : 'status-rejected'}">
              Registration Status: ${status.toUpperCase()}
            </div>
            
            ${isApproved ? `
              <p>Congratulations! Your NGO registration has been approved. You can now:</p>
              <ul>
                <li>Access your NGO dashboard</li>
                <li>Create and manage campaigns</li>
                <li>Organize volunteer events</li>
                <li>Connect with volunteers</li>
              </ul>
              <p>Please log in to your account to get started.</p>
            ` : `
              <p>Your NGO registration requires some updates before it can be approved.</p>
              ${rejectionReason ? `
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <strong>Reason for rejection:</strong> ${rejectionReason}
                </div>
              ` : ''}
              <p>Please log in to your account and update the required information.</p>
            `}
            
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

    console.log(`📧 Attempting to send NGO status email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ NGO status email sent successfully to: ${email}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send NGO status email to ${email}:`, error);
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

// Get all pending NGO registrations
export const getPendingNGOs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build search query
    const searchQuery: any = {
      role: 'ngo_admin',
      verificationStatus: 'pending'
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pendingNGOs = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      message: 'Pending NGO registrations retrieved successfully',
      data: {
        ngos: pendingNGOs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get all NGOs (approved, pending, rejected)
export const getAllNGOs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build search query
    const searchQuery: any = {
      role: 'ngo_admin'
    };

    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      searchQuery.verificationStatus = status;
    }

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const ngos = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(searchQuery);

    // Get counts by status
    const statusCounts = await User.aggregate([
      { $match: { role: 'ngo_admin' } },
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
    ]);

    const counts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as any);

    res.status(200).json({
      success: true,
      message: 'NGO registrations retrieved successfully',
      data: {
        ngos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        statusCounts: {
          pending: counts.pending || 0,
          approved: counts.approved || 0,
          rejected: counts.rejected || 0
        }
      }
    });

  } catch (error) {
    console.error('Get all NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Approve NGO registration
export const approveNGO = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;
    const { approvalNotes } = req.body;

    const ngo = await User.findById(ngoId);
    if (!ngo) {
      res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
      return;
    }

    if (ngo.role !== 'ngo_admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an NGO admin'
      });
      return;
    }

    // Update NGO status
    ngo.verificationStatus = 'approved';
    ngo.isNGOVerified = true;
    ngo.isVerified = true;
    
    // Add approval metadata (you can extend the model to store this)
    await ngo.save();

    // Send email notification to NGO about approval
    try {
      await sendNGOStatusUpdate(
        ngo.email, 
        ngo.organizationName || ngo.name, 
        'approved',
        approvalNotes
      );
      console.log(`📧 Approval email sent to NGO: ${ngo.email}`);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email sending fails
    }

    res.status(200).json({
      success: true,
      message: 'NGO approved successfully',
      data: {
        ngo: ngo.toJSON()
      }
    });

  } catch (error) {
    console.error('Approve NGO error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Reject NGO registration
export const rejectNGO = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
      return;
    }

    const ngo = await User.findById(ngoId);
    if (!ngo) {
      res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
      return;
    }

    if (ngo.role !== 'ngo_admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an NGO admin'
      });
      return;
    }

    // Update NGO status
    ngo.verificationStatus = 'rejected';
    ngo.isNGOVerified = false;
    ngo.rejectionReason = rejectionReason.trim();
    
    // Add rejection metadata (you can extend the model to store this)
    await ngo.save();

    // Send email notification to NGO about rejection
    try {
      await sendNGOStatusUpdate(
        ngo.email, 
        ngo.organizationName || ngo.name, 
        'rejected',
        rejectionReason.trim()
      );
      console.log(`📧 Rejection email sent to NGO: ${ngo.email}`);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email sending fails
    }

    res.status(200).json({
      success: true,
      message: 'NGO registration rejected',
      data: {
        ngo: ngo.toJSON()
      }
    });

  } catch (error) {
    console.error('Reject NGO error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get NGO details by ID
export const getNGODetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;

    const ngo = await User.findById(ngoId).select('-password');
    if (!ngo) {
      res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
      return;
    }

    if (ngo.role !== 'ngo_admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an NGO admin'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'NGO details retrieved successfully',
      data: {
        ngo: ngo.toJSON()
      }
    });

  } catch (error) {
    console.error('Get NGO details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update NGO verification status (general purpose)
export const updateNGOStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
      return;
    }

    const ngo = await User.findById(ngoId);
    if (!ngo) {
      res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
      return;
    }

    if (ngo.role !== 'ngo_admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an NGO admin'
      });
      return;
    }

    // Update NGO status
    ngo.verificationStatus = status;
    ngo.isNGOVerified = status === 'approved';
    ngo.isVerified = status === 'approved';
    
    await ngo.save();

    res.status(200).json({
      success: true,
      message: `NGO status updated to ${status}`,
      data: {
        ngo: ngo.toJSON()
      }
    });

  } catch (error) {
    console.error('Update NGO status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
