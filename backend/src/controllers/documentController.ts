import { Request, Response } from 'express';
import User from '../models/User.js';
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
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
};

const transporter = nodemailer.createTransport(emailConfig);

// Send NGO status update email
const sendNGOApprovalEmail = async (
  email: string, 
  organizationName: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `NGO Registration Approved - ${organizationName}`,
      text: `Hello ${organizationName}, Congratulations! Your NGO registration has been approved. You can now access your dashboard and start creating campaigns.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NGO Registration Approved</title>
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
            .status-box { 
              background-color: #d4edda; 
              color: #155724; 
              border: 1px solid #c3e6cb;
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
              <h2 style="color: #495057; margin: 0;">🎉 Congratulations!</h2>
              <p style="color: #6c757d; margin: 10px 0 0 0;">CareConnect Platform</p>
            </div>
            
            <p>Hello ${organizationName},</p>
            
            <div class="status-box">
              Your NGO Registration has been APPROVED!
            </div>
            
            <p>Great news! Your NGO registration has been approved. You can now:</p>
            <ul>
              <li>Access your NGO dashboard</li>
              <li>Create and manage campaigns</li>
              <li>Organize volunteer events</li>
              <li>Connect with volunteers in your community</li>
            </ul>
            
            <p><strong>Next Steps:</strong> Log in to your account to get started with making a difference!</p>
            
            <div class="footer">
              <p>Best regards,<br>The CareConnect Team</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      headers: {
        'X-Mailer': 'CareConnect Platform',
        'X-Priority': '3',
        'Importance': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@careconnect.com>',
        'List-Id': 'CareConnect Notifications <notifications.careconnect.com>'
      }
    };

    console.log(`📧 Attempting to send NGO approval email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ NGO approval email sent successfully to: ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send NGO approval email to ${email}:`, error);
    return false;
  }
};

// Send NGO document rejection email
const sendNGODocumentRejectionEmail = async (
  email: string, 
  organizationName: string,
  documentType: string,
  rejectionReason: string
): Promise<boolean> => {
  try {
    // Convert document type to readable format
    const documentNames: { [key: string]: string } = {
      'registrationCertificate': 'Registration Certificate',
      'taxExemptionCertificate': 'Tax Exemption Certificate', 
      'organizationalLicense': 'Organizational License'
    };
    
    const readableDocumentName = documentNames[documentType] || documentType;

    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Document Revision Required - ${organizationName}`,
      text: `Hello ${organizationName}, Your ${readableDocumentName} requires revision. Reason: ${rejectionReason}. Please log in to your account to resubmit the document.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document Revision Required</title>
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
            .status-box { 
              background-color: #fff3cd; 
              color: #856404; 
              border: 1px solid #ffeaa7;
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
              text-align: center;
              font-weight: bold;
            }
            .reason-box {
              background-color: #f8d7da;
              border: 1px solid #f5c6cb;
              color: #721c24;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
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
              <h2 style="color: #495057; margin: 0;">📋 Document Revision Required</h2>
              <p style="color: #6c757d; margin: 10px 0 0 0;">CareConnect Platform</p>
            </div>
            
            <p>Hello ${organizationName},</p>
            
            <div class="status-box">
              ${readableDocumentName} requires revision
            </div>
            
            <p>We've reviewed your submitted documents and found that your <strong>${readableDocumentName}</strong> needs to be updated before we can proceed with your registration.</p>
            
            <div class="reason-box">
              <strong>Reason for revision:</strong><br>
              ${rejectionReason}
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Log in to your CareConnect account</li>
              <li>Navigate to the document submission section</li>
              <li>Upload a revised version of your ${readableDocumentName}</li>
              <li>Address the specific concerns mentioned above</li>
            </ul>
            
            <p>Once you've uploaded the revised document, our team will review it promptly. If you have any questions about the revision requirements, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The CareConnect Review Team</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      headers: {
        'X-Mailer': 'CareConnect Platform',
        'X-Priority': '3',
        'Importance': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@careconnect.com>',
        'List-Id': 'CareConnect Notifications <notifications.careconnect.com>'
      }
    };

    console.log(`📧 Attempting to send document rejection email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Document rejection email sent successfully to: ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send document rejection email to ${email}:`, error);
    return false;
  }
};

// Approve a specific document
export const approveDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ngoId, documentType } = req.params;
    
    const validDocumentTypes = ['registrationCertificate', 'taxExemptionCertificate', 'organizationalLicense'];
    if (!validDocumentTypes.includes(documentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
      return;
    }

    // Find the NGO user
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

    // Update document status
    if (!ngo.documents) {
      ngo.documents = {};
    }
    
    if (!ngo.documents[documentType as keyof typeof ngo.documents]) {
      res.status(400).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    ngo.documents[documentType as keyof typeof ngo.documents].status = 'approved';
    ngo.documents[documentType as keyof typeof ngo.documents].rejectionReason = undefined;

    // Check if all documents are approved
    const allDocumentsApproved = 
      ngo.documents.registrationCertificate?.status === 'approved' &&
      ngo.documents.taxExemptionCertificate?.status === 'approved' &&
      ngo.documents.organizationalLicense?.status === 'approved';

    // Check if this is the first time all documents are approved
    const wasAlreadyApproved = ngo.verificationStatus === 'approved';

    if (allDocumentsApproved && !wasAlreadyApproved) {
      ngo.verificationStatus = 'approved';
      ngo.isNGOVerified = true;
      ngo.rejectionReason = undefined;
      console.log(`✅ All documents approved - NGO approved: ${ngo.email}`);
      
      // Send approval email to NGO (only on first approval)
      try {
        await sendNGOApprovalEmail(ngo.email, ngo.organizationName || ngo.name);
      } catch (emailError) {
        console.error('Failed to send NGO approval email:', emailError);
        // Don't fail the approval if email sending fails
      }
    } else if (allDocumentsApproved && wasAlreadyApproved) {
      console.log(`✅ Document approved but NGO was already approved: ${ngo.email}`);
    }

    await ngo.save();

    console.log(`✅ Document approved: ${documentType} for ${ngo.email}`);

    res.status(200).json({
      success: true,
      message: `Document ${documentType} approved successfully`,
      data: {
        documentStatus: ngo.documents[documentType as keyof typeof ngo.documents].status,
        overallStatus: ngo.verificationStatus,
        allDocumentsApproved
      }
    });

  } catch (error) {
    console.error('Error approving document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject a specific document
export const rejectDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ngoId, documentType } = req.params;
    const { rejectionReason } = req.body;
    
    const validDocumentTypes = ['registrationCertificate', 'taxExemptionCertificate', 'organizationalLicense'];
    if (!validDocumentTypes.includes(documentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
      return;
    }

    if (!rejectionReason || rejectionReason.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
      return;
    }

    // Find the NGO user
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

    // Update document status
    if (!ngo.documents) {
      ngo.documents = {};
    }
    
    if (!ngo.documents[documentType as keyof typeof ngo.documents]) {
      res.status(400).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    ngo.documents[documentType as keyof typeof ngo.documents].status = 'rejected';
    ngo.documents[documentType as keyof typeof ngo.documents].rejectionReason = rejectionReason.trim();

    // Keep status as pending - NGO can resubmit rejected documents
    // Only set to rejected if admin explicitly rejects the entire application
    ngo.isNGOVerified = false;
    // Store rejection info in a separate field for tracking
    if (!ngo.rejectionHistory) {
      ngo.rejectionHistory = [];
    }
    ngo.rejectionHistory.push({
      documentType,
      reason: rejectionReason.trim(),
      rejectedAt: new Date()
    });

    await ngo.save();

    // Send document rejection email to NGO
    try {
      await sendNGODocumentRejectionEmail(ngo.email, ngo.organizationName, documentType, rejectionReason.trim());
      console.log(`📧 Document rejection email sent to ${ngo.email} for ${documentType}`);
    } catch (emailError) {
      console.error('❌ Failed to send document rejection email:', emailError);
      // Don't fail the rejection process if email fails
    }

    console.log(`❌ Document rejected: ${documentType} for ${ngo.email} - Reason: ${rejectionReason}`);

    res.status(200).json({
      success: true,
      message: `Document ${documentType} rejected successfully`,
      data: {
        documentStatus: ngo.documents[documentType as keyof typeof ngo.documents].status,
        overallStatus: ngo.verificationStatus,
        rejectionReason: rejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejecting document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get document status for an NGO
export const getDocumentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;

    const ngo = await User.findById(ngoId).select('documents verificationStatus rejectionReason');
    if (!ngo) {
      res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        documents: ngo.documents,
        verificationStatus: ngo.verificationStatus,
        rejectionReason: ngo.rejectionReason
      }
    });

  } catch (error) {
    console.error('Error getting document status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
