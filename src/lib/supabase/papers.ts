import { createClient } from './client'
import { Database } from './types'

type Paper = Database['public']['Tables']['papers']['Row']
type PaperInsert = Database['public']['Tables']['papers']['Insert']
type ProjectPaper = Database['public']['Tables']['project_papers']['Row']
type ProjectPaperInsert = Database['public']['Tables']['project_papers']['Insert']

export interface PaperData {
  pmid: string
  title: string
  authors: string[]
  journal: string
  pubDate: string
  abstract: string
}

export async function savePaperToProject(
  projectId: string,
  paperData: PaperData,
  userId: string,
  notes?: string,
  tags?: string[]
): Promise<{ paper: Paper; projectPaper: ProjectPaper }> {
  const supabase = createClient()

  // Verify user owns the project first
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  // Check if paper already exists
  const { data: existingPaper, error: paperLookupError } = await supabase
    .from('papers')
    .select('id')
    .eq('pmid', paperData.pmid)
    .maybeSingle()  // Use maybeSingle to avoid errors when no record found

  // Only throw error if it's not a "no rows" error
  if (paperLookupError && paperLookupError.code !== 'PGRST116') {
    console.error('Error looking up existing paper:', paperLookupError)
    // Continue anyway, we'll try to create the paper
  }

  let paper: Paper

  if (existingPaper) {
    // Paper exists, just use it
    const { data: foundPaper, error: fetchError } = await supabase
      .from('papers')
      .select('*')
      .eq('id', existingPaper.id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing paper:', fetchError)
      throw new Error('Failed to fetch existing paper')
    }

    paper = foundPaper
  } else {
    // Create new paper
    const { data: newPaper, error: paperError } = await supabase
      .from('papers')
      .insert({
        pmid: paperData.pmid,
        title: paperData.title,
        authors: paperData.authors as any, // Cast to Json type
        journal: paperData.journal,
        pub_date: paperData.pubDate,
        abstract: paperData.abstract,
      })
      .select()
      .single()

    if (paperError) {
      console.error('Error saving paper:', paperError)
      throw new Error(`Failed to save paper: ${paperError.message}`)
    }

    paper = newPaper
  }

  // Check if paper is already in this project
  const { data: existingProjectPaper, error: checkError } = await supabase
    .from('project_papers')
    .select('id')
    .eq('project_id', projectId)
    .eq('paper_id', paper.id)
    .maybeSingle()  // Use maybeSingle instead of single to avoid errors when no record found

  // Only throw error if it's not a "no rows" error
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking for existing project paper:', checkError)
    // Don't throw error, just log it and continue
  }

  if (existingProjectPaper) {
    throw new Error('Paper is already saved to this project')
  }

  // Add paper to project
  const { data: projectPaper, error: relationError } = await supabase
    .from('project_papers')
    .insert({
      project_id: projectId,
      paper_id: paper.id,
      notes: notes || null,
      tags: tags || null,
    })
    .select()
    .single()

  if (relationError) {
    console.error('Error linking paper to project:', relationError)
    throw new Error('Failed to add paper to project')
  }

  return { paper, projectPaper }
}

export async function getProjectPapers(projectId: string, userId: string): Promise<(Paper & { notes?: string; tags?: string[]; saved_at: string })[]> {
  const supabase = createClient()

  // Verify user owns the project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  const { data, error } = await supabase
    .from('project_papers')
    .select(`
      notes,
      tags,
      created_at,
      papers (
        id,
        pmid,
        title,
        authors,
        journal,
        pub_date,
        abstract,
        created_at
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project papers:', error)
    throw new Error('Failed to fetch project papers')
  }

  return (data || []).map(item => {
    // Handle the case where papers might be an array or object
    const paper = Array.isArray(item.papers) ? item.papers[0] : item.papers
    
    return {
      id: paper.id,
      pmid: paper.pmid,
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal,
      pub_date: paper.pub_date,
      abstract: paper.abstract,
      created_at: paper.created_at,
      notes: item.notes,
      tags: item.tags as string[] | undefined,
      saved_at: item.created_at,
    }
  })
}

export async function removePaperFromProject(
  projectId: string,
  paperId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  // Verify user owns the project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  const { error } = await supabase
    .from('project_papers')
    .delete()
    .eq('project_id', projectId)
    .eq('paper_id', paperId)

  if (error) {
    console.error('Error removing paper from project:', error)
    throw new Error('Failed to remove paper from project')
  }
}

export async function isPaperSavedToProject(
  projectId: string,
  pmid: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_papers')
    .select('id')
    .eq('project_id', projectId)
    .eq('papers.pmid', pmid)
    .limit(1)

  if (error) {
    console.error('Error checking if paper is saved:', error)
    return false
  }

  return (data && data.length > 0) || false
}

export async function getPapersSavedByUser(
  userId: string,
  pmids: string[]
): Promise<{ pmid: string; projects: { id: string; name: string }[] }[]> {
  const supabase = createClient()

  // Get papers that match the PMIDs
  const { data: papers, error } = await supabase
    .from('papers')
    .select('id, pmid')
    .in('pmid', pmids)

  if (error) {
    console.error('Error fetching papers:', error)
    return []
  }

  if (!papers || papers.length === 0) {
    return []
  }

  // Get project associations for these papers
  const { data: projectPapers, error: projectError } = await supabase
    .from('project_papers')
    .select(`
      paper_id,
      projects!inner (
        id,
        name,
        user_id
      )
    `)
    .in('paper_id', papers.map(p => p.id))
    .eq('projects.user_id', userId)

  if (projectError) {
    console.error('Error fetching project papers:', projectError)
    return []
  }

  // Group by PMID
  const result: { pmid: string; projects: { id: string; name: string }[] }[] = []
  
  pmids.forEach(pmid => {
    const paper = papers.find(p => p.pmid === pmid)
    if (paper) {
      const paperProjects = projectPapers
        ?.filter(pp => pp.paper_id === paper.id)
        .map(pp => ({
          id: (pp.projects as any).id,
          name: (pp.projects as any).name
        })) || []
      
      result.push({
        pmid,
        projects: paperProjects
      })
    } else {
      result.push({
        pmid,
        projects: []
      })
    }
  })

  return result
}