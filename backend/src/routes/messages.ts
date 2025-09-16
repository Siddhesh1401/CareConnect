import express from 'express';
import { Request, Response } from 'express';
import Message from '../models/Message.js';
import BroadcastMessage from '../models/BroadcastMessage.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { isNGOAdmin, isVolunteer } from '../middleware/roleAuth.js';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Send message to admin (public endpoint for anonymous users)
router.post('/send-public', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, priority = 'medium', category = 'other' } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject and message are required'
      });
    }

    const newMessage = new Message({
      userId: null, // Anonymous user
      userName: name.trim(),
      userEmail: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      priority,
      category,
      conversation: {
        messages: [{
          id: `user-${Date.now()}`,
          sender: 'user',
          message: message.trim(),
          timestamp: new Date()
        }]
      }
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent to admin successfully',
      data: { message: newMessage }
    });

  } catch (error) {
    console.error('Send public message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Send message to admin (authenticated users)
router.post('/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, priority = 'medium', category = 'other' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newMessage = new Message({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      subject: subject.trim(),
      message: message.trim(),
      priority,
      category,
      conversation: {
        messages: [{
          id: `user-${Date.now()}`,
          sender: 'user',
          message: message.trim(),
          timestamp: new Date()
        }]
      }
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent to admin successfully',
      data: { message: newMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get user's messages
router.get('/my-messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });

  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({ 
      _id: messageId, 
      userId: req.user.id 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// User reply to message
router.post('/:messageId/reply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { message: replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const message = await Message.findOne({ 
      _id: messageId, 
      userId: req.user.id 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add reply to conversation
    const newReply = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      message: replyMessage.trim(),
      timestamp: new Date()
    };

    message.conversation.messages.push(newReply);
    message.status = 'replied';
    message.updatedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });

  } catch (error) {
    console.error('User reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ==================== BROADCAST ROUTES ====================

// NGO sends broadcast message to volunteers
router.post('/ngo/broadcast', authenticate, isNGOAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, priority = 'medium', targetFilters = {} } = req.body;

    console.log('Broadcast request:', { subject, message, priority, targetFilters }); // Debug log

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Get NGO info
    const ngo = await User.findById(req.user.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    // Build query to find target volunteers
    let volunteerQuery: any = {
      role: 'volunteer'
      // Removed isActive: true to be more permissive
    };

    // Apply filters
    if (targetFilters?.status === 'active') {
      // For now, we'll consider all volunteers as active
      // In the future, this could be based on recent activity
    }

    if (targetFilters?.skills && targetFilters.skills.length > 0) {
      volunteerQuery.skills = { $in: targetFilters.skills };
    }

    if (targetFilters?.minEventsJoined) {
      // This would require event participation tracking
      // For now, we'll skip this filter
    }

    if (targetFilters?.location) {
      volunteerQuery['location.city'] = new RegExp(targetFilters.location, 'i');
    }

    console.log('Volunteer query:', volunteerQuery); // Debug log

    // Find target volunteers
    const targetVolunteers = await User.find(volunteerQuery).select('_id name email');
    console.log('Found volunteers:', targetVolunteers.length); // Debug log

    const recipientIds = targetVolunteers.map(v => v._id);

    // If no specific filters applied, send to all volunteers
    // If filters are applied but no matches, return error
    const hasFilters = targetFilters && (
      targetFilters.status || 
      (targetFilters.skills && targetFilters.skills.length > 0) || 
      targetFilters.location ||
      targetFilters.minEventsJoined
    );

    console.log('Has filters:', hasFilters, 'Recipient count:', recipientIds.length); // Debug log

    if (hasFilters && recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No volunteers match the specified criteria'
      });
    }

    // If no filters, send to all volunteers (minimum 1 required)
    if (!hasFilters && recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No volunteers found in the system. Please ensure there are registered volunteers.'
      });
    }

    // Create broadcast message
    const broadcast = new BroadcastMessage({
      ngoId: ngo._id,
      ngoName: ngo.name || ngo.organizationName,
      subject: subject.trim(),
      message: message.trim(),
      priority,
      targetFilters: targetFilters || {}, // Ensure it's not undefined
      recipientIds,
      status: 'sent',
      sentAt: new Date(),
      deliveredIds: [...recipientIds], // Set delivered IDs immediately
      stats: {
        totalRecipients: recipientIds.length,
        totalDelivered: recipientIds.length,
        totalRead: 0,
        totalReplied: 0,
        deliveryRate: 100, // All recipients are marked as delivered
        readRate: 0,
        replyRate: 0
      }
    });

    console.log('Creating broadcast with targetFilters:', targetFilters); // Debug log

    await broadcast.save();

    console.log('Broadcast saved successfully with ID:', broadcast._id); // Debug log

    const responseData = {
      success: true,
      message: `Broadcast sent successfully to ${recipientIds.length} volunteers`,
      data: {
        broadcast: {
          _id: broadcast._id,
          subject: broadcast.subject,
          recipientCount: recipientIds.length,
          sentAt: broadcast.sentAt
        }
      }
    };

    console.log('Sending response:', responseData); // Debug log

    res.status(201).json(responseData);

  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get NGO's broadcast history
router.get('/ngo/broadcasts', authenticate, isNGOAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const broadcasts = await BroadcastMessage.find({ ngoId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('subject priority status sentAt stats createdAt');

    const total = await BroadcastMessage.countDocuments({ ngoId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Broadcast history retrieved successfully',
      data: {
        broadcasts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get broadcast history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get specific broadcast details
router.get('/ngo/broadcasts/:broadcastId', authenticate, isNGOAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { broadcastId } = req.params;

    const broadcast = await BroadcastMessage.findOne({
      _id: broadcastId,
      ngoId: req.user.id
    });

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: 'Broadcast not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Broadcast details retrieved successfully',
      data: broadcast
    });

  } catch (error) {
    console.error('Get broadcast details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get volunteer's received broadcasts
router.get('/volunteer/broadcasts', authenticate, isVolunteer, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const broadcasts = await BroadcastMessage.find({
      recipientIds: req.user.id,
      status: 'sent'
    })
      .populate('ngoId', 'name organizationName')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark broadcasts as read
    const unreadBroadcasts = broadcasts.filter(b => !b.readIds.includes(req.user.id));
    if (unreadBroadcasts.length > 0) {
      const broadcastIds = unreadBroadcasts.map(b => b._id);
      await BroadcastMessage.updateMany(
        { _id: { $in: broadcastIds } },
        { $addToSet: { readIds: req.user.id } }
      );
    }

    const total = await BroadcastMessage.countDocuments({
      recipientIds: req.user.id,
      status: 'sent'
    });

    res.status(200).json({
      success: true,
      message: 'Broadcasts retrieved successfully',
      data: {
        broadcasts: broadcasts.map(b => ({
          ...b.toObject(),
          isRead: b.readIds.includes(req.user.id)
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get volunteer broadcasts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Volunteer replies to broadcast
router.post('/volunteer/broadcasts/:broadcastId/reply', authenticate, isVolunteer, async (req: AuthRequest, res: Response) => {
  try {
    const { broadcastId } = req.params;
    const { message: replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const broadcast = await BroadcastMessage.findOne({
      _id: broadcastId,
      recipientIds: req.user.id
    });

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: 'Broadcast not found'
      });
    }

    // Add volunteer to replied list
    if (!broadcast.repliedIds.includes(req.user.id)) {
      broadcast.repliedIds.push(req.user.id);
      await broadcast.save();
    }

    // Create a regular message for the reply
    const volunteer = await User.findById(req.user.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const replyMessageDoc = new Message({
      userId: volunteer._id,
      userName: volunteer.name,
      userEmail: volunteer.email,
      userPhone: volunteer.phone,
      subject: `Re: ${broadcast.subject}`,
      message: replyMessage.trim(),
      priority: 'medium',
      category: 'feedback',
      conversation: {
        messages: [{
          id: `volunteer-${Date.now()}`,
          sender: 'user',
          message: replyMessage.trim(),
          timestamp: new Date()
        }]
      }
    });

    await replyMessageDoc.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Reply to broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get replies to a specific broadcast (for NGO)
router.get('/ngo/broadcasts/:broadcastId/replies', authenticate, isNGOAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { broadcastId } = req.params;

    // First verify the broadcast belongs to this NGO
    const broadcast = await BroadcastMessage.findOne({
      _id: broadcastId,
      ngoId: req.user.id
    });

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: 'Broadcast not found'
      });
    }

    // Find all replies to this broadcast
    // Replies are stored as regular Message documents with subject "Re: {original subject}"
    const replies = await Message.find({
      subject: new RegExp(`^Re: ${broadcast.subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      userId: { $in: broadcast.recipientIds } // Only from recipients of this broadcast
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Broadcast replies retrieved successfully',
      data: {
        broadcast: {
          _id: broadcast._id,
          subject: broadcast.subject,
          totalReplies: replies.length
        },
        replies: replies.map(reply => ({
          _id: reply._id,
          volunteerName: reply.userName,
          volunteerEmail: reply.userEmail,
          message: reply.message,
          repliedAt: reply.createdAt,
          conversation: reply.conversation
        }))
      }
    });

  } catch (error) {
    console.error('Get broadcast replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get all replies to NGO's broadcasts
router.get('/ngo/broadcasts-replies', authenticate, isNGOAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get all broadcasts by this NGO
    const ngoBroadcasts = await BroadcastMessage.find({ ngoId: req.user.id });
    const broadcastSubjects = ngoBroadcasts.map(b => `Re: ${b.subject}`);

    if (broadcastSubjects.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No broadcasts found',
        data: {
          replies: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Find replies to any of the NGO's broadcasts
    const replies = await Message.find({
      subject: { $in: broadcastSubjects }
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Message.countDocuments({
      subject: { $in: broadcastSubjects }
    });

    res.status(200).json({
      success: true,
      message: 'Broadcast replies retrieved successfully',
      data: {
        replies: replies.map(reply => {
          // Find which broadcast this reply belongs to
          const broadcastSubject = broadcastSubjects.find(sub => reply.subject === sub);
          const originalBroadcast = ngoBroadcasts.find(b => `Re: ${b.subject}` === broadcastSubject);

          return {
            _id: reply._id,
            broadcastId: originalBroadcast?._id,
            broadcastSubject: originalBroadcast?.subject,
            volunteerName: reply.userName,
            volunteerEmail: reply.userEmail,
            message: reply.message,
            repliedAt: reply.createdAt,
            conversation: reply.conversation
          };
        }),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all broadcast replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;