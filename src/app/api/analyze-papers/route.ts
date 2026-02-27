import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env.local file
})

export async function POST(request: NextRequest) {
  try {
    const { papers, projectId, analysisType = 'comprehensive' } = await request.json()

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json({ error: 'No papers provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Handle large datasets by batching papers if necessary
    const MAX_PAPERS_PER_REQUEST = 20 // Limit to avoid token limits
    const papersToAnalyze = papers.slice(0, MAX_PAPERS_PER_REQUEST)

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(papersToAnalyze, analysisType)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 for better analysis
      messages: [
        {
          role: "system",
          content: "You are an expert research analyst specializing in scientific literature review. Provide comprehensive, structured analysis of research papers focusing on themes, gaps, insights, and future directions. Use clear formatting with headers and bullet points."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent, analytical responses
    })
    
    const rawResponse = completion.choices[0]?.message?.content

    if (!rawResponse) {
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 })
    }

    // Parse the response to extract chart data and analysis
    const { chartData, analysis } = parseAnalysisResponse(rawResponse)

    // Save analysis results to database using service role client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: saveError } = await supabaseAdmin
      .from('projects')
      .update({
        ai_analysis: analysis,
        ai_chart_data: chartData,
        ai_analysis_date: new Date().toISOString()
      })
      .eq('id', projectId)

    if (saveError) {
      console.error('Failed to save analysis results:', saveError)
      // Continue anyway - return results even if save failed
    }

    const result = {
      analysis,
      chartData,
      paperCount: papersToAnalyze.length,
      totalPapers: papers.length,
      limited: papers.length > MAX_PAPERS_PER_REQUEST,
      model: "gpt-4o",
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)

  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your billing.' 
      }, { status: 429 })
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'Invalid OpenAI API key. Please check your configuration.' 
      }, { status: 401 })
    }

    if (error.code === 'model_not_found' || error.message?.includes('model')) {
      return NextResponse.json({ 
        error: 'OpenAI model not available. Please try again.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: `Failed to analyze papers: ${error.message}` 
    }, { status: 500 })
  }
}

function parseAnalysisResponse(rawResponse: string): { chartData: any, analysis: string } {
  try {
    // Split response into JSON and analysis parts
    const parts = rawResponse.split('---ANALYSIS---')
    
    if (parts.length !== 2) {
      // Fallback if format is not as expected
      return {
        chartData: null,
        analysis: rawResponse
      }
    }

    const jsonPart = parts[0].trim()
    const analysisPart = parts[1].trim()
    
    // Extract JSON from the response
    const jsonMatch = jsonPart.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const chartData = JSON.parse(jsonMatch[0])
      return {
        chartData: chartData.chartData,
        analysis: analysisPart
      }
    }
    
    return {
      chartData: null,
      analysis: rawResponse
    }
  } catch (error) {
    console.error('Error parsing analysis response:', error)
    return {
      chartData: null,
      analysis: rawResponse
    }
  }
}

function buildAnalysisPrompt(papers: any[], analysisType: string): string {
  // Truncate abstracts to reduce token usage
  const MAX_ABSTRACT_LENGTH = 400 // Characters, not tokens
  
  const paperSummaries = papers.map((paper, index) => {
    let abstract = paper.abstract || 'No abstract available'
    if (abstract.length > MAX_ABSTRACT_LENGTH) {
      abstract = abstract.substring(0, MAX_ABSTRACT_LENGTH) + '...'
    }
    
    return `
**Paper ${index + 1}:**
- **Title**: ${paper.title}
- **Authors**: ${Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || 'Unknown'}
- **Journal**: ${paper.journal} (${paper.pub_date ? new Date(paper.pub_date).getFullYear() : 'N/A'})
- **PMID**: ${paper.pmid}
- **Abstract**: ${abstract}
${paper.tags && paper.tags.length > 0 ? `- **Tags**: ${paper.tags.join(', ')}` : ''}
`}).join('\n---\n')

  // Shortened prompt to reduce token usage
  return `Analyze ${papers.length} research papers. Provide structured data + analysis.

IMPORTANT: Start with JSON in EXACT format:
{
  "chartData": {
    "publicationYears": [{"year": "2020", "count": 5}],
    "studyTypes": [{"type": "Clinical Trial", "count": 12}],
    "researchThemes": [{"theme": "Cancer Treatment", "count": 15}],
    "sampleSizes": [{"range": "< 100", "count": 10}],
    "qualityScores": [{"quality": "High Quality", "count": 18}],
    "geographicRegions": [{"region": "North America", "count": 12}]
  }
}
---ANALYSIS---

Then provide analysis covering:

<h2>🎯 <strong>Thematic Analysis</strong></h2>
<p>Main themes, patterns, and research focus areas.</p>

<h2>🔍 <strong>Research Gaps & Opportunities</strong></h2> 
<p>Understudied areas and methodological limitations.</p>

<h2>📊 <strong>Key Findings & Insights</strong></h2>
<p>Important discoveries, controversies, and breakthroughs.</p>

<h2>🚀 <strong>Future Research Directions</strong></h2>
<p>Next steps and promising research questions.</p>

<h2>📈 <strong>Research Landscape Overview</strong></h2>
<p>Field maturity, trends, and leading institutions.</p>

Use HTML formatting throughout your response. Use <h2> for main sections, <h3> for subsections, <p> for paragraphs, <ul> and <li> for bullet points, and <strong> for emphasis.

Papers:

${paperSummaries}

Start with JSON, then analysis after "---ANALYSIS---"`
}