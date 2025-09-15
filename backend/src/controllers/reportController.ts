import { Request, Response } from 'express';
import Report, { IReport, ReportType } from '../models/Report.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name?: string;
  };
}

// Report reasons for different types
export const REPORT_REASONS = {
  event: [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'Violence or threats',
    'Hate speech',
    'Copyright violation',
    'False information',
    'Other'
  ],
  campaign: [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'Violence or threats',
    'Hate speech',
    'Copyright violation',
    'False information',
    'Scam or fraud',
    'Other'
  ],
  community: [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'Violence or threats',
    'Hate speech',
    'Copyright violation',
    'False information',
    'Other'
  ],
  ngo: [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'Violence or threats',
    'Hate speech',
    'Copyright violation',
    'False information',
    'Scam or fraud',
    'Other'
  ],
  story: [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'Violence or threats',
    'Hate speech',
    'Copyright violation',
    'False information',
    'Plagiarism',
    'Other'
  ]
};

// Create a new report
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { type, targetId, reason, description } = req.body;

    // Validate report type
    if (!REPORT_REASONS[type as ReportType]) {
      res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
      return;
    }

    // Validate reason
    if (!REPORT_REASONS[type as ReportType].includes(reason)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reason for this report type'
      });
      return;
    }

    // Check if user already reported this item
    const existingReport = await Report.findOne({
      type,
      targetId,
      reporterId: req.user.id
    });

    if (existingReport) {
      res.status(400).json({
        success: false,
        message: 'You have already reported this item'
      });
      return;
    }

    const report = new Report({
      type,
      targetId,
      reporterId: req.user.id,
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report'
    });
  }
};

// Get all reports (Admin only)
export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { page = 1, limit = 10, status, type } = req.query;

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'name email')
      .populate('resolvedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// Get report by ID (Admin only)
export const getReportById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporterId', 'name email')
      .populate('resolvedBy', 'name');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
};

// Update report status (Admin only)
export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { reportId } = req.params;
    const { status, adminResponse } = req.body;

    const validStatuses = ['pending', 'under_review', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }

    const updateData: any = {
      status,
      resolvedBy: req.user.id
    };

    if (status === 'resolved' || status === 'rejected') {
      updateData.resolvedAt = new Date();
      if (adminResponse) {
        updateData.adminResponse = adminResponse;
      }
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    ).populate('reporterId', 'name email')
     .populate('resolvedBy', 'name');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report status updated successfully'
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report status'
    });
  }
};

// Delete report (Admin only)
export const deleteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { reportId } = req.params;

    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report'
    });
  }
};

// Get report reasons for a specific type
export const getReportReasons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;

    if (!REPORT_REASONS[type as ReportType]) {
      res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        type,
        reasons: REPORT_REASONS[type as ReportType]
      }
    });
  } catch (error) {
    console.error('Error fetching report reasons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report reasons'
    });
  }
};

// Get user's reports
export const getUserReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const reports = await Report.find({ reporterId: req.user.id })
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reports'
    });
  }
};