# Add AI Analysis Storage to Projects Table

Run this SQL in your Supabase SQL editor to add AI analysis storage to the projects table:

```sql
-- Add AI analysis columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS ai_chart_data JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis_date TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on projects with analysis
CREATE INDEX IF NOT EXISTS projects_ai_analysis_date_idx ON projects(ai_analysis_date);
```

This adds:
- `ai_analysis` - Stores the text analysis results
- `ai_chart_data` - Stores the JSON chart data 
- `ai_analysis_date` - Tracks when analysis was last run