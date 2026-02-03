-- Run this in your Supabase SQL Editor to add the missing columns

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS produto_oferta text,
ADD COLUMN IF NOT EXISTS mes_competencia date;
