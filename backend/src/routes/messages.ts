import express from 'express';
import { Request, Response } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

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

export default router;