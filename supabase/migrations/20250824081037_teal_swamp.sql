/*
  # Add NGO Document Storage

  1. New Tables
    - `ngo_documents`
      - `id` (uuid, primary key)
      - `ngo_id` (uuid, foreign key to users table)
      - `document_type` (text, enum: registration_cert, tax_exemption, organizational_license)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (integer)
      - `mime_type` (text)
      - `upload_date` (timestamp)
      - `verification_status` (text, enum: pending, approved, rejected)
      - `verified_by` (uuid, foreign key to users table)
      - `verified_at` (timestamp)
      - `rejection_reason` (text)

  2. Security
    - Enable RLS on `ngo_documents` table
    - Add policies for NGO admins to manage their own documents
    - Add policies for system admins to verify documents

  3. Storage
    - Create storage bucket for NGO documents
    - Set up proper access policies for document storage
*/

-- Create enum types
CREATE TYPE document_type AS ENUM ('registration_cert', 'tax_exemption', 'organizational_license');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create ngo_documents table
CREATE TABLE IF NOT EXISTS ngo_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  verification_status verification_status DEFAULT 'pending',
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ngo_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for NGO admins to manage their own documents
CREATE POLICY "NGO admins can view their own documents"
  ON ngo_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = ngo_id);

CREATE POLICY "NGO admins can insert their own documents"
  ON ngo_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ngo_id);

CREATE POLICY "NGO admins can update their own documents"
  ON ngo_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = ngo_id)
  WITH CHECK (auth.uid() = ngo_id);

-- Create policies for system admins
CREATE POLICY "System admins can view all documents"
  ON ngo_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System admins can update document verification"
  ON ngo_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_documents_ngo_id ON ngo_documents(ngo_id);
CREATE INDEX IF NOT EXISTS idx_ngo_documents_type ON ngo_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_ngo_documents_status ON ngo_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_ngo_documents_upload_date ON ngo_documents(upload_date);

-- Create storage bucket for NGO documents (if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ngo-documents', 'ngo-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "NGO admins can upload their documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ngo-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "NGO admins can view their documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ngo-documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "System admins can view all NGO documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ngo-documents' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ngo_documents_updated_at
  BEFORE UPDATE ON ngo_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();