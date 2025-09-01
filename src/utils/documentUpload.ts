// Document upload utility functions
export interface DocumentUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export interface DocumentValidation {
  isValid: boolean;
  error?: string;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateDocument = (file: File): DocumentValidation => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF, JPG, and PNG files are allowed'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { isValid: true };
};

export const uploadDocument = async (
  file: File,
  ngoId: string,
  documentType: 'registration_cert' | 'tax_exemption' | 'organizational_license'
): Promise<DocumentUploadResult> => {
  try {
    // Validate file first
    const validation = validateDocument(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ngoId', ngoId);
    formData.append('documentType', documentType);

    // In a real app, this would upload to your storage service
    // For now, we'll simulate the upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful upload
    const fileUrl = `/documents/${ngoId}/${documentType}/${file.name}`;

    // Store document metadata in database
    const documentData = {
      ngo_id: ngoId,
      document_type: documentType,
      file_name: file.name,
      file_path: fileUrl,
      file_size: file.size,
      mime_type: file.type,
      verification_status: 'pending'
    };

    console.log('Document uploaded:', documentData);

    return {
      success: true,
      fileUrl
    };
  } catch (error) {
    console.error('Document upload failed:', error);
    return {
      success: false,
      error: 'Failed to upload document. Please try again.'
    };
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    // In a real app, this would delete from storage and database
    console.log('Deleting document:', documentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Document deletion failed:', error);
    return false;
  }
};

export const getDocumentUrl = (filePath: string): string => {
  // In a real app, this would generate a signed URL for secure access
  return filePath;
};

export const verifyDocument = async (
  documentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const verificationData = {
      verification_status: status,
      verified_by: 'current-admin-id', // Would be actual admin ID
      verified_at: new Date().toISOString(),
      rejection_reason: rejectionReason || null
    };

    console.log('Verifying document:', documentId, verificationData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Document verification failed:', error);
    return false;
  }
};