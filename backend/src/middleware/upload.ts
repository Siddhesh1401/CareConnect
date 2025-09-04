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

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
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
