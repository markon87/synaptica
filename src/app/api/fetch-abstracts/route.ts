import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()
    const { supabase } = createClient(request)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Create service role client for database updates (bypasses RLS)
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get papers without abstracts
    const { data: papers, error } = await supabase
      .from('project_papers')
      .select(`
        papers!inner (
          id,
          pmid,
          abstract
        ),
        projects!inner (
          id,
          user_id
        )
      `)
      .eq('project_id', projectId)
      .eq('projects.user_id', user.id)
    
    if (error) {
      return NextResponse.json({ error: `Failed to get papers: ${error.message}` }, { status: 500 })
    }
    
    // Filter papers that don't have abstracts (null or empty)
    const papersWithoutAbstracts = papers?.filter(row => {
      const paper = Array.isArray(row.papers) ? row.papers[0] : row.papers
      return !paper.abstract || paper.abstract.trim() === ''
    }) || []
    console.log('Sample PMIDs being processed:', papersWithoutAbstracts.slice(0, 5).map(row => {
      const paper = Array.isArray(row.papers) ? row.papers[0] : row.papers
      return paper.pmid
    }))
    
    let updated = 0
    let failed = 0
    
    for (const row of papersWithoutAbstracts) {
      const paper = Array.isArray(row.papers) ? row.papers[0] : row.papers
      
      try {
        // Fetch abstract from PubMed using efetch for XML format
        const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${paper.pmid}&retmode=xml&rettype=abstract`)
        
        if (response.ok) {
          const xmlText = await response.text()
          
          // Extract all abstract texts from XML (handles structured abstracts)
          const abstractMatches = xmlText.match(/<AbstractText[^>]*>[\s\S]*?<\/AbstractText>/g)
          let abstract = null
          
          if (abstractMatches && abstractMatches.length > 0) {
            // Combine all abstract sections
            abstract = abstractMatches
              .map(match => match.replace(/<AbstractText[^>]*>|<\/AbstractText>/g, '').trim())
              .filter(text => text.length > 0)
              .join(' ')
          }
          
          if (abstract && abstract.length > 10) { // Ensure we have a meaningful abstract
            // Clean up HTML entities and tags
            const cleanAbstract = abstract
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .trim()
            
            console.log(`Saving abstract for ${paper.pmid} (ID: ${paper.id}), length:`, cleanAbstract.length)
            
            // Update paper with abstract using service role client (bypasses RLS)
            const { error: updateError, data: updateResult } = await supabaseAdmin
              .from('papers')
              .update({ abstract: cleanAbstract })
              .eq('id', paper.id)
              .select()
            
            if (updateError) {
              failed++
            } else if (!updateResult || updateResult.length === 0) {
              failed++
            } else {
              updated++
            }
          } else {
            failed++
          }
        } else {
          failed++
        }
      } catch (error) {
        failed++
      }
    }

    return NextResponse.json({ updated, failed })
  } catch (error: any) {
    console.error('Error in fetch-abstracts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}