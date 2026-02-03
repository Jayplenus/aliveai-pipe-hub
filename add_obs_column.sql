-- Adds the 'obs' column for observations
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS obs text;
