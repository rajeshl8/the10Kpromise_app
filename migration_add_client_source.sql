-- Add client_source column to protections table
-- Run this in Supabase SQL Editor

ALTER TABLE public.protections 
ADD COLUMN IF NOT EXISTS client_source text;

-- Create index for filtering/reporting
CREATE INDEX IF NOT EXISTS idx_protections_source 
ON public.protections(client_source);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'protections' 
  AND column_name = 'client_source';

