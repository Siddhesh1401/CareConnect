import { Request, Response } from 'express';
import User, { IUser } from '../models/User.js';
import Message from '../models/Message.js';
import { AppError } from '../utils/AppError.js';
import { getUserAvatarUrl } from '../middleware/upload.js';
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

// Send response email to user
const sendResponseEmail = async (
  userEmail: string,
  userName: string,
  originalSubject: string,
  originalMessage: string,
  adminResponse: string
): Promise<boolean> => {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log('📧 [DEV MODE] Admin Response Email:');
      console.log(`   To: ${userEmail}`);
      console.log(`   User: ${userName}`);
      console.log(`   Response: ${adminResponse}`);
      return true;
    }

    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Re: ${originalSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Response - CareConnect</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .original-message { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; }
            .admin-response { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Response from CareConnect Admin</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Thank you for contacting CareConnect. We have reviewed your message and here is our response:</p>
              
              <div class="original-message">
                <h4>Your Original Message:</h4>
                <p><strong>Subject:</strong> ${originalSubject}</p>
                <p>${originalMessage.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div class="admin-response">
                <h4>Our Response:</h4>
                <p>${adminResponse.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us again through our website.</p>
              
              <p>Best regards,<br>CareConnect Support Team</p>
            </div>
            <div class="footer">
              <p>This email was sent in response to your inquiry on CareConnect platform.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Response email sent successfully to: ${userEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send response email to ${userEmail}:`, error);
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

// Get all volunteers only
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const searchQuery: any = {
      role: 'volunteer' // Only show volunteers
    };

    if (status && ['active', 'suspended'].includes(status as string)) {
      searchQuery.accountStatus = status;
    }

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(searchQuery);

    const stats = await User.aggregate([
      {
        $match: { role: 'volunteer' } // Only count volunteers
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $ne: ['$accountStatus', 'suspended'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$accountStatus', 'suspended'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats: stats[0] || {
          total: 0,
          active: 0,
          suspended: 0
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Toggle user status (active/suspended)
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Toggle status
    const newStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended';
    const oldStatus = user.accountStatus;
    user.accountStatus = newStatus;
    await user.save();

    // Log the admin activity
    console.log(`🔧 Admin action: User ${user.name} (${user.email}) status changed from ${oldStatus} to ${newStatus} by admin ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update user avatar (Admin only)
export const updateUserAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Handle avatar upload
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = getUserAvatarUrl(req.file.filename);
    }

    user.profilePicture = avatarUrl;
    await user.save();

    // Log the admin activity
    console.log(`🔧 Admin action: User ${user.name} (${user.email}) avatar updated by admin ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'User avatar updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Update user avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [userStats, ngoStats, recentUsers, recentNGOs] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: [{ $ne: ['$accountStatus', 'suspended'] }, 1, 0] } }
          }
        }
      ]),
      
      // NGO statistics
      User.aggregate([
        {
          $match: { role: 'ngo_admin' }
        },
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent users (last 5)
      User.find({ role: 'volunteer' })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
        
      // Recent NGO requests (last 3 pending)
      User.find({ role: 'ngo_admin', verificationStatus: 'pending' })
        .select('name organizationName email createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    // Process user stats
    const processedUserStats = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {} as any);

    // Process NGO stats
    const processedNGOStats = ngoStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    const totalUsers = (processedUserStats.volunteer?.count || 0) + (processedUserStats.ngo_admin?.count || 0);
    const totalNGOs = (processedNGOStats.approved || 0) + (processedNGOStats.pending || 0) + (processedNGOStats.rejected || 0);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        stats: {
          totalUsers,
          totalVolunteers: processedUserStats.volunteer?.count || 0,
          activeNGOs: processedNGOStats.approved || 0,
          pendingNGOs: processedNGOStats.pending || 0,
          totalNGOs
        },
        recentUsers: recentUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          joinedDate: (user as any).createdAt
        })),
        pendingNGORequests: recentNGOs.map(ngo => ({
          id: ngo._id,
          organizationName: ngo.organizationName || ngo.name,
          contactPerson: ngo.name,
          email: ngo.email,
          submittedDate: (ngo as any).createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get all messages for admin
export const getAllMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status = '', priority = '', category = '', search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Send response to message
export const respondToMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
      return;
    }

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    // Add admin response to conversation
    message.conversation.messages.push({
      id: `admin-${Date.now()}`,
      sender: 'admin',
      message: response.trim(),
      timestamp: new Date()
    });

    message.adminResponse = response.trim();
    message.responseTimestamp = new Date();
    message.status = 'replied';

    await message.save();

    // Send email notification to user
    try {
      await sendResponseEmail(
        message.userEmail,
        message.userName,
        message.subject,
        message.message,
        response.trim()
      );
      console.log(`📧 Response email sent to: ${message.userEmail}`);
    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Respond to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update message status
export const updateMessageStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied', 'closed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get analytics data for charts and metrics
export const getAnalyticsData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user growth data (monthly aggregation)
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalUsers: { $sum: 1 },
          volunteers: {
            $sum: { $cond: [{ $eq: ['$role', 'volunteer'] }, 1, 0] }
          },
          ngos: {
            $sum: { $cond: [{ $eq: ['$role', 'ngo_admin'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format user growth data for charts
    const formattedUserGrowth = userGrowthData.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      users: item.totalUsers,
      volunteers: item.volunteers,
      ngos: item.ngos
    }));

    // Get NGO status distribution
    const ngoStatusData = await User.aggregate([
      { $match: { role: 'ngo_admin' } },
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedNGOStatus = ngoStatusData.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: item._id === 'approved' ? '#10B981' :
             item._id === 'pending' ? '#F59E0B' : '#EF4444'
    }));

    // Get system activity data (daily aggregation for the time range)
    const activityData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          lastLogin: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' }
          },
          logins: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get total users count
    const totalUsers = await User.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalNGOs = await User.countDocuments({ role: 'ngo_admin' });
    const activeNGOs = await User.countDocuments({
      role: 'ngo_admin',
      verificationStatus: 'approved'
    });

    // Calculate growth percentages (comparing with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const currentPeriodUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });

    const userGrowthPercent = previousPeriodUsers > 0
      ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers * 100)
      : 0;

    // Mock campaign data (since we don't have a Campaign model yet)
    const campaignPerformanceData = [
      { name: 'Education Drive', donations: 25000, participants: 120 },
      { name: 'Healthcare Camp', donations: 18000, participants: 95 },
      { name: 'Environment Clean', donations: 15000, participants: 85 },
      { name: 'Food Distribution', donations: 22000, participants: 110 },
      { name: 'Skill Development', donations: 30000, participants: 140 }
    ];

    // Format activity data for charts
    const formattedActivityData = activityData.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      logins: item.logins,
      actions: Math.floor(item.logins * 2.5), // Mock actions data
      errors: Math.floor(Math.random() * 5) // Mock errors data
    }));

    res.status(200).json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        userGrowth: formattedUserGrowth,
        ngoStatus: formattedNGOStatus,
        campaignPerformance: campaignPerformanceData,
        activity: formattedActivityData,
        metrics: {
          totalUsers,
          totalVolunteers,
          totalNGOs,
          activeNGOs,
          totalDonations: 110000, // Mock data
          systemActivity: formattedActivityData.reduce((sum, day) => sum + day.actions, 0),
          userGrowthPercent: Math.round(userGrowthPercent * 10) / 10
        }
      }
    });

  } catch (error) {
    console.error('Get analytics data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
