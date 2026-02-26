import { createClient } from './client'
import { Database } from './types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export async function createProject(
  name: string,
  description: string | null,
  userId: string
): Promise<Project> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      user_id: userId,
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }
  
  return data
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects')
  }
  
  return data || []
}

export async function getProject(projectId: string, userId: string): Promise<Project | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId) // Ensure user owns the project
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null // Project not found
    }
    console.error('Error fetching project:', error)
    throw new Error('Failed to fetch project')
  }
  
  return data
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Omit<ProjectUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('user_id', userId) // Ensure user owns the project
    .select()
    .single()
    
  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }
  
  return data
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId) // Ensure user owns the project
    
  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }
}