# Supabase Database Setup

This file contains the SQL commands needed to set up your Supabase database for the Synaptica project management system.

## Required Tables

Run these SQL commands in your Supabase SQL editor:

### 1. Papers Table
```sql
-- Create papers table
CREATE TABLE IF NOT EXISTS papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pmid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]'::jsonb,
  journal TEXT NOT NULL,
  pub_date TEXT NOT NULL,
  abstract TEXT NOT NULL DEFAULT '',
  pmcid TEXT,
  doi TEXT,
  full_text TEXT,
  full_text_source TEXT,
  full_text_status TEXT DEFAULT 'none' CHECK (full_text_status IN ('none', 'available', 'fetching', 'completed', 'failed')),
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster PMID lookups
CREATE INDEX IF NOT EXISTS papers_pmid_idx ON papers(pmid);
```

### 2. Projects Table  
```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user projects
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
```

### 3. Project Papers Junction Table
```sql
-- Create project_papers junction table
CREATE TABLE IF NOT EXISTS project_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a paper can only be saved once per project
  UNIQUE(project_id, paper_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_papers_project_id_idx ON project_papers(project_id);
CREATE INDEX IF NOT EXISTS project_papers_paper_id_idx ON project_papers(paper_id);
```

### 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;  
ALTER TABLE project_papers ENABLE ROW LEVEL SECURITY;

-- COMPREHENSIVE CLEANUP: Drop ALL existing policies to eliminate duplicates
-- Projects table policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "projects_policy" ON projects;
DROP POLICY IF EXISTS "users_manage_own_projects" ON projects;

-- Papers table policies
DROP POLICY IF EXISTS "Anyone can view papers" ON papers;
DROP POLICY IF EXISTS "Authenticated users can insert papers" ON papers;
DROP POLICY IF EXISTS "papers_policy" ON papers;
DROP POLICY IF EXISTS "papers_read_policy" ON papers;
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_create_policy" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;

-- Project papers table policies (drop ALL variations)
DROP POLICY IF EXISTS "Users can manage papers in their projects" ON project_papers;
DROP POLICY IF EXISTS "Users can view own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can create own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can update own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can delete own project papers" ON project_papers;
DROP POLICY IF EXISTS "project_papers_policy" ON project_papers;
DROP POLICY IF EXISTS "project_papers_manage_policy" ON project_papers;

-- Create single consolidated policies for optimal performance
-- Projects: Users can only access their own projects (single policy for all operations)
CREATE POLICY "users_manage_own_projects" ON projects
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Papers: Separate policies for read vs write operations
CREATE POLICY "papers_select_policy" ON papers
  FOR SELECT
  USING (true);

CREATE POLICY "papers_insert_policy" ON papers
  FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Project Papers: Users can only manage papers in their own projects
CREATE POLICY "project_papers_manage_policy" ON project_papers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_papers.project_id 
      AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_papers.project_id 
      AND projects.user_id = (select auth.uid())
    )
  );
```

### 5. Updated At Trigger (Optional)
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for projects table
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## After Running These Commands

1. Make sure all tables are created successfully
2. Check that RLS policies are active
3. Test creating a project and saving a paper
4. Verify that users can only see their own data

## Performance Optimization: Clean Up All Duplicate Policies

If you're experiencing multiple performance warnings, run this comprehensive cleanup:

```sql
-- Clean up any profiles table policies (common source of duplicates)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

-- Additional cleanup for project_papers table specific duplicates
DROP POLICY IF EXISTS "Users can view own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can create own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can update own project papers" ON project_papers;
DROP POLICY IF EXISTS "Users can delete own project papers" ON project_papers;
DROP POLICY IF EXISTS "project_papers_manage_policy" ON project_papers;

-- Additional cleanup for papers table specific duplicates  
DROP POLICY IF EXISTS "papers_read_policy" ON papers;
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_create_policy" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;

-- Recreate the consolidated policies
CREATE POLICY "papers_select_policy" ON papers
  FOR SELECT
  USING (true);

CREATE POLICY "papers_insert_policy" ON papers
  FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Recreate the single consolidated project_papers policy
CREATE POLICY "project_papers_manage_policy" ON project_papers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_papers.project_id 
      AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_papers.project_id 
      AND projects.user_id = (select auth.uid())
    )
  );

-- If you have a profiles table, create a single consolidated policy
-- CREATE POLICY "profiles_manage_own" ON profiles
--   FOR ALL
--   USING ((select auth.uid()) = id)
--   WITH CHECK ((select auth.uid()) = id);

-- Check for any remaining duplicate policies across all tables
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, cmd, roles;

-- Check for any policies with multiple roles that might cause conflicts
SELECT tablename, cmd, array_agg(policyname) as policies, count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, cmd, roles
HAVING count(*) > 1;
```

## Troubleshooting

If you get errors when saving papers:

1. Check that the `pmid` is unique in the papers table
2. Verify that your user has proper authentication
3. Make sure RLS policies are not blocking legitimate operations
4. Check the Supabase logs for detailed error messages

## Authentication Setup

Make sure you have authentication set up in your Supabase project:
- Enable at least one auth provider (email/password recommended for testing)
- Users should be able to sign up and sign in
- The `auth.users` table should exist and be populated when users register