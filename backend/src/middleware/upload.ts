import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const documentsDir = path.join(__dirname, '../../uploads/documents');
const eventsDir = path.join(__dirname, '../../uploads/events');
const communitiesDir = path.join(__dirname, '../../uploads/communities');
const usersDir = path.join(__dirname, '../../uploads/users');
const ngosDir = path.join(__dirname, '../../uploads/ngos');
const campaignsDir = path.join(__dirname, '../../uploads/campaigns');
const storiesDir = path.join(__dirname, '../../uploads/stories');

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
}

if (!fs.existsSync(communitiesDir)) {
  fs.mkdirSync(communitiesDir, { recursive: true });
}

if (!fs.existsSync(usersDir)) {
  fs.mkdirSync(usersDir, { recursive: true });
}

if (!fs.existsSync(ngosDir)) {
  fs.mkdirSync(ngosDir, { recursive: true });
}

if (!fs.existsSync(campaignsDir)) {
  fs.mkdirSync(campaignsDir, { recursive: true });
}

if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}

// Configure multer for document upload
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for event image upload
const eventImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `event_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for community image upload
const communityImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, communitiesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `community_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for user avatar upload
const userAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, usersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `avatar_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for NGO image upload
const ngoImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ngosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `ngo_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for campaign image upload
const campaignImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, campaignsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `campaign_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// Configure multer for story image upload
const storyImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storiesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `story_${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter for documents
const documentFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

// File filter for event images
const imageFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and GIF images are allowed'), false);
  }
};

// Configure multer for documents
export const upload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: documentFilter
});

// Configure multer for event images
export const uploadEventImages = multer({
  storage: eventImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Configure multer for community images
export const uploadCommunityImages = multer({
  storage: communityImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Configure multer for user avatars
export const uploadUserAvatar = multer({
  storage: userAvatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Configure multer for NGO images
export const uploadNGOImages = multer({
  storage: ngoImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Configure multer for campaign images
export const uploadCampaignImages = multer({
  storage: campaignImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Configure multer for story images
export const uploadStoryImages = multer({
  storage: storyImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: imageFilter
});

// Middleware for NGO document upload
export const uploadNGODocuments = upload.fields([
  { name: 'registrationCert', maxCount: 1 },
  { name: 'taxExemption', maxCount: 1 },
  { name: 'organizationalLicense', maxCount: 1 }
]);

// Helper function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/documents/${filename}`;
};

// Helper function to get event image URL
export const getEventImageUrl = (filename: string): string => {
  return `/uploads/events/${filename}`;
};

// Helper function to get community image URL
export const getCommunityImageUrl = (filename: string): string => {
  return `/uploads/communities/${filename}`;
};

// Helper function to get user avatar URL
export const getUserAvatarUrl = (filename: string): string => {
  return `/uploads/users/${filename}`;
};

// Helper function to get NGO image URL
export const getNGOImageUrl = (filename: string): string => {
  return `/uploads/ngos/${filename}`;
};

// Helper function to get campaign image URL
export const getCampaignImageUrl = (filename: string): string => {
  return `/uploads/campaigns/${filename}`;
};

// Helper function to get story image URL
export const getStoryImageUrl = (filename: string): string => {
  return `/uploads/stories/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename: string): void => {
  const filePath = path.join(documentsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to delete event image
export const deleteEventImage = (filename: string): void => {
  const filePath = path.join(eventsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to delete community image
export const deleteCommunityImage = (filename: string): void => {
  const filePath = path.join(communitiesDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to delete user avatar
export const deleteUserAvatar = (filename: string): void => {
  const filePath = path.join(usersDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to delete NGO image
export const deleteNGOImage = (filename: string): void => {
  const filePath = path.join(ngosDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to delete campaign image
export const deleteCampaignImage = (filename: string): void => {
  const filePath = path.join(campaignsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
