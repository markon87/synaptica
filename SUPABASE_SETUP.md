# 🚀 Synaptica - Supabase Setup Instructions

## ✅ What We've Built

Your authentication system is now ready! Here's what's been implemented:

### 🔐 **Authentication System**
- **Sign In/Sign Up Forms** with email/password and Google OAuth
- **Protected Routes** (dashboard requires authentication)
- **Authentication State Management** across the app
- **User Menu** with sign out functionality

### 📁 **Project Structure**
```
src/
├── lib/supabase/           # Supabase configuration
├── components/
│   ├── auth/               # Sign in/up forms
│   └── providers/          # Auth context provider
├── app/
│   ├── auth/signin/        # Sign in page
│   ├── auth/signup/        # Sign up page
│   ├── dashboard/          # Protected dashboard
│   └── search/             # PubMed search (moved from /test)
└── middleware.ts           # Route protection
```

## 🎯 **Next Steps: Set Up Your Supabase Project**

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose organization and enter project details
5. Wait for project setup to complete

### 2. Get Your Environment Variables
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon** key
3. Update your `.env.local` file:

```bash
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set Up Database Tables
Run this SQL in your Supabase **SQL Editor**:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create papers table
CREATE TABLE papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pmid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]',
  journal TEXT NOT NULL,
  pub_date TEXT NOT NULL,
  abstract TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_papers junction table
CREATE TABLE project_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, paper_id)
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_papers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Papers policies (anyone can read, authenticated users can create)
CREATE POLICY "Anyone can view papers" ON papers FOR SELECT TO authenticated;
CREATE POLICY "Authenticated users can create papers" ON papers FOR INSERT TO authenticated WITH CHECK (true);

-- Project papers policies
CREATE POLICY "Users can view own project papers" ON project_papers FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_papers.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create own project papers" ON project_papers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_papers.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update own project papers" ON project_papers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_papers.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete own project papers" ON project_papers FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_papers.project_id AND projects.user_id = auth.uid())
);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4. (Optional) Enable Google OAuth
If you want Google sign-in:
1. Go to **Authentication** → **Providers**
2. Enable Google provider
3. Add your Google OAuth credentials

## 🎉 **Test Your Setup**

1. Start your dev server: `npm run dev`
2. Go to `/auth/signup` and create an account
3. Check your email for confirmation
4. Sign in and visit `/dashboard`
5. Test the user menu and sign out

## 🔄 **What's Next?**

Your authentication foundation is complete! Ready for:
- **Project Management System** (create/organize research projects)
- **Save Papers to Projects** (from PubMed search)
- **Database Integration** (store and retrieve user data)

Perfect foundation for the full Synaptica platform! 🚀