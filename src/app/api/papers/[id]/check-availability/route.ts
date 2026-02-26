import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import FullTextService from '@/lib/fulltext/FullTextService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = createClient(request)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: projectPapers, error: papersError } = await supabase
      .from('project_papers')
      .select(`
        papers (
          id,
          pmid,
          title,
          pmcid,
          doi
        )
      `)
      .eq('project_id', projectId)

    if (papersError) {
      console.error('Error fetching papers:', papersError)
      return NextResponse.json({ error: `Failed to fetch papers: ${papersError.message}` }, { status: 500 })
    }

    if (!projectPapers || projectPapers.length === 0) {
      return NextResponse.json([])
    }

    // Process papers sequentially with delays to avoid overwhelming PubMed API
    const results: any[] = []
    
    for (let i = 0; i < projectPapers.length; i++) {
      const item = projectPapers[i]
      const paper = Array.isArray(item.papers) ? item.papers[0] : item.papers
      
      try {
        // Add delay between requests (except for first request)
        if (i > 0) {
          const delayMs = 500 // 500ms delay between requests
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        
        const sources = await FullTextService.checkAvailability(paper.pmid, paper.pmcid || undefined)
        
        results.push({
          paperId: paper.id,
          pmid: paper.pmid,
          title: paper.title,
          hasFullText: sources.length > 0,
          sources
        })
        
      } catch (error) {
        console.error(`Error checking availability for ${paper.pmid}:`, error)
        results.push({
          paperId: paper.id,
          pmid: paper.pmid,
          title: paper.title,
          hasFullText: false,
          sources: []
        })
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error checking free access availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}