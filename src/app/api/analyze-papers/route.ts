import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env.local file
})

export async function POST(request: NextRequest) {
  try {
    const { papers, analysisType = 'comprehensive' } = await request.json()

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json({ error: 'No papers provided' }, { status: 400 })
    }

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(papers, analysisType)

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

    return NextResponse.json({
      analysis,
      chartData,
      paperCount: papers.length,
      model: "gpt-4o",
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in paper analysis:', error)
    
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

    return NextResponse.json({ 
      error: 'Failed to analyze papers. Please try again.' 
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
  const paperSummaries = papers.map((paper, index) => `
**Paper ${index + 1}:**
- **Title**: ${paper.title}
- **Authors**: ${paper.authors.join(', ')}
- **Journal**: ${paper.journal} (${paper.pub_date ? new Date(paper.pub_date).getFullYear() : 'N/A'})
- **PMID**: ${paper.pmid}
- **Abstract**: ${paper.abstract}
${paper.notes ? `- **Notes**: ${paper.notes}` : ''}
${paper.tags && paper.tags.length > 0 ? `- **Tags**: ${paper.tags.join(', ')}` : ''}
`).join('\n---\n')

  return `You are a research analyst specializing in biomedical literature. Analyze the following ${papers.length} research papers and provide both structured data for visualization AND a comprehensive written analysis.

IMPORTANT: Start your response with structured data in this EXACT JSON format (must be valid JSON):
{
  "chartData": {
    "publicationYears": [{"year": "2020", "count": 5}, {"year": "2021", "count": 8}],
    "studyTypes": [{"type": "Clinical Trial", "count": 12}, {"type": "Systematic Review", "count": 5}, {"type": "Observational Study", "count": 8}],
    "researchThemes": [{"theme": "Cancer Treatment", "count": 15}, {"theme": "Drug Discovery", "count": 8}],
    "sampleSizes": [{"range": "< 100", "count": 10}, {"range": "100-500", "count": 8}, {"range": "500-1000", "count": 5}, {"range": "> 1000", "count": 3}],
    "qualityScores": [{"quality": "High Quality", "count": 18}, {"quality": "Medium Quality", "count": 7}, {"quality": "Lower Quality", "count": 2}],
    "geographicRegions": [{"region": "North America", "count": 12}, {"region": "Europe", "count": 8}, {"region": "Asia", "count": 6}]
  }
}
---ANALYSIS---

After the JSON, provide your detailed written analysis covering:

## 1. 🎯 **Thematic Analysis**
- Identify the main research themes and patterns
- Group papers by research focus areas
- Highlight emerging trends and methodological approaches

## 2. 🔍 **Research Gaps & Opportunities** 
- Point out understudied areas or missing perspectives
- Identify methodological limitations across studies
- Suggest areas that need more investigation

## 3. 📊 **Key Findings & Insights**
- Summarize the most important discoveries and conclusions
- Note any conflicting results or controversies
- Highlight breakthrough findings or novel approaches

## 4. 🚀 **Future Research Directions**
- Suggest logical next steps based on current findings
- Identify promising research questions to pursue
- Recommend methodological improvements or innovations

## 5. 📈 **Research Landscape Overview**
- Assess the maturity of the research field
- Note temporal trends and evolution of approaches
- Identify leading research groups or institutions

Here are the papers:

${paperSummaries}

Remember: Start with the JSON data, then provide the detailed analysis after "---ANALYSIS---"`
}