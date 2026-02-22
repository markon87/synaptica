export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // User profiles table
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Projects table
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Papers table  
      papers: {
        Row: {
          id: string
          pmid: string
          title: string
          authors: Json
          journal: string
          pub_date: string
          abstract: string
          created_at: string
        }
        Insert: {
          id?: string
          pmid: string
          title: string
          authors: Json
          journal: string
          pub_date: string
          abstract: string
          created_at?: string
        }
        Update: {
          id?: string
          pmid?: string
          title?: string
          authors?: Json
          journal?: string
          pub_date?: string
          abstract?: string
          created_at?: string
        }
      }
      
      // Project papers junction table
      project_papers: {
        Row: {
          id: string
          project_id: string
          paper_id: string
          notes: string | null
          tags: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          paper_id: string
          notes?: string | null
          tags?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          paper_id?: string
          notes?: string | null
          tags?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}