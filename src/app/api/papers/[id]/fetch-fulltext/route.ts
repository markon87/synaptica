import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import FullTextService from '@/lib/fulltext/FullTextService'

export async function POST(
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

    const { id: paperId } = await params
    const { pmid, pmcid } = await request.json()

    // Get paper and verify user has access to it via their projects
    const { data: paperAccess, error: accessError } = await supabase
      .from('project_papers')
      .select(`
        papers (
          id,
          pmid,
          pmcid,
          doi
        ),
        projects!inner (
          user_id
        )
      `)
      .eq('paper_id', paperId)
      .eq('projects.user_id', user.id)
      .single()

    if (accessError || !paperAccess) {
      return NextResponse.json({ error: 'Paper not found or access denied' }, { status: 404 })
    }

    const paper = Array.isArray(paperAccess.papers) ? paperAccess.papers[0] : paperAccess.papers

    // Update status to fetching
    await supabase
      .from('papers')
      .update({ full_text_status: 'fetching' })
      .eq('id', paperId)

    try {
      // Fetch full text
      console.log(`Fetching full text for paper ${paperId}, PMID: ${paper.pmid}, PMC ID: ${pmcid || paper.pmcid}`)
      const fullText = await FullTextService.getFullText(paper.pmid, pmcid || paper.pmcid || undefined)
      
      if (fullText) {
        console.log(`Successfully fetched full text for ${paperId}`)
        // Update paper with full text
        await supabase
          .from('papers')
          .update({
            full_text: fullText.fullText,
            full_text_source: fullText.source.source,
            full_text_status: 'completed',
            sections: fullText.sections
          })
          .eq('id', paperId)

        return NextResponse.json({ success: true, fullText })
      } else {
        console.log(`No full text found for paper ${paperId}`)
        // No full text found
        await supabase
          .from('papers')
          .update({ full_text_status: 'failed' })
          .eq('id', paperId)

        return NextResponse.json({ 
          error: 'No full text available. This may occur if: 1) The paper is not in PMC open access collection, 2) PMC API is temporarily unavailable, or 3) The paper format is not supported.' 
        }, { status: 404 })
      }
    } catch (fetchError) {
      console.error('Error fetching full text for paper', paperId, ':', fetchError)
      
      // Update status to failed
      await supabase
        .from('papers')
        .update({ full_text_status: 'failed' })
        .eq('id', paperId)

      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error occurred'
      return NextResponse.json({ 
        error: `Failed to fetch full text: ${errorMessage}. Please check browser console for details.`
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in fetch full text API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}