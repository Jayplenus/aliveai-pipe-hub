-- Run this script in Supabase SQL Editor to safely add the missing columns.
-- This script creates them as OPTIONAL (Nullable) which prevents the "contains null values" error (code 23502).

-- 1. Add produto_oferta (Optional text)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS produto_oferta text;

-- 2. Add mes_competencia (Optional date)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS mes_competencia date;

-- 3. Verify columns exist
SELECT column_name, is_nullable, data_type
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('produto_oferta', 'mes_competencia');
