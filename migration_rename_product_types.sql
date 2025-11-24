-- Migration: Rename product types to new branding
-- Date: 2025-01-24
-- Purpose: Update product type names in all existing records

-- Update existing records
UPDATE public.protections 
SET product_type = 'Legacy Plan' 
WHERE product_type = 'Will&Trust';

UPDATE public.protections 
SET product_type = 'Financial Security Plan' 
WHERE product_type = 'Term Life';

-- Verify the changes
SELECT 
  product_type,
  COUNT(*) as count
FROM public.protections
GROUP BY product_type
ORDER BY product_type;

-- Expected results:
-- Legacy Plan: (count of former Will&Trust)
-- Financial Security Plan: (count of former Term Life)

