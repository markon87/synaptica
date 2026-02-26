-- SQL script to add AI analysis columns to papers table
-- Run this in your Supabase SQL Editor

-- Add columns for full text storage and AI analysis
ALTER TABLE papers 
ADD COLUMN IF NOT EXISTS full_text TEXT,
ADD COLUMN IF NOT EXISTS full_text_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS full_text_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS sections JSONB,
ADD COLUMN IF NOT EXISTS pmcid VARCHAR(50),
ADD COLUMN IF NOT EXISTS doi VARCHAR(255);

-- Update existing papers to have default status first
UPDATE papers 
SET full_text_status = 'none' 
WHERE full_text_status IS NULL;

-- Make full_text_status NOT NULL after setting defaults
ALTER TABLE papers 
ALTER COLUMN full_text_status SET NOT NULL;

-- Add check constraint for full_text_status (will fail silently if exists)
DO $$ 
BEGIN
    ALTER TABLE papers 
    ADD CONSTRAINT papers_full_text_status_check 
    CHECK (full_text_status IN ('none', 'available', 'fetching', 'completed', 'failed'));
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Constraint already exists, ignore
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_papers_full_text_status ON papers(full_text_status);
CREATE INDEX IF NOT EXISTS idx_papers_pmcid ON papers(pmcid);
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);