"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
import { getPapersForAIAnalysis } from "@/lib/supabase/papers"
import { getProjectAnalysis } from "@/lib/supabase/projects"
import { 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  FileText,
  Sparkles,
  BookOpen,
  Brain
} from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

// Simple Badge component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border-border',
  }
  
  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )} 
      {...props} 
    />
  )
}

interface PaperForAI {
  id: string
  pmid: string
  title: string
  authors: string[]
  journal: string
  pub_date: string
  abstract: string
  tags?: string[]
}

interface PrepareAIAnalysisProps {
  projectId: string
  onAnalysisReady?: (papers: PaperForAI[]) => void
}

export function FreeAccessPapers({ projectId, onAnalysisReady }: PrepareAIAnalysisProps) {
  const { user } = useAuth()
  const [papers, setPapers] = useState<PaperForAI[]>([])
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [fetchingAbstracts, setFetchingAbstracts] = useState(false)
  const [analysisDate, setAnalysisDate] = useState<string | null>(null)
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false)

  useEffect(() => {
    if (user && projectId) {
      loadPapersForAnalysis()
      loadSavedAnalysis()
    }
  }, [user, projectId])

  const loadSavedAnalysis = async () => {
    if (!user) return
    
    try {
      const savedAnalysis = await getProjectAnalysis(projectId, user.id)
      if (savedAnalysis && savedAnalysis.analysis) {
        setAiAnalysis(savedAnalysis.analysis)
        setChartData(savedAnalysis.chartData)
        setAnalysisDate(savedAnalysis.analysisDate)
        setHasExistingAnalysis(true)
      }
    } catch (error) {
      console.error('Error loading saved analysis:', error)
    }
  }

  const loadPapersForAnalysis = async () => {
    try {
      setLoading(true)
      const analysisData = await getPapersForAIAnalysis(projectId, user!.id)
      setPapers(analysisData)
    } catch (error) {
      console.error('Error loading papers for analysis:', error)
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  const handlePrepareForAI = async () => {
    if (!user || papers.length === 0) return

    try {
      setPreparing(true)
      // Call the optional callback if provided
      onAnalysisReady?.(papers)
    } catch (error) {
      console.error('Error preparing for AI analysis:', error)
      alert('Failed to prepare papers for AI analysis.')
    } finally {
      setPreparing(false)
    }
  }

  const getAbstractPreview = (abstract: string, maxLength: number = 150) => {
    if (!abstract) return 'No abstract available'
    if (abstract.length <= maxLength) return abstract
    return abstract.substring(0, maxLength) + '...'
  }

  const runAIAnalysis = async () => {
    if (!user || papers.length === 0) return

    try {
      setAnalyzing(true)
      setAnalysisError(null)
      
      const response = await fetch('/api/analyze-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          papers: papers,
          projectId: projectId,
          analysisType: 'comprehensive'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAiAnalysis(data.analysis)
      setChartData(data.chartData)
      setAnalysisDate(new Date().toISOString())
      setHasExistingAnalysis(true)
    } catch (error: any) {
      console.error('Error running AI analysis:', error)
      setAnalysisError(error.message || 'Failed to analyze papers')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFetchAbstracts = async () => {
    if (!user) return
    
    try {
      setFetchingAbstracts(true)
      
      const response = await fetch('/api/fetch-abstracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch abstracts')
      }
      
      if (result.updated > 0) {
        // Add a small delay to ensure database commits are complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Reload papers after fetching abstracts
        await loadPapersForAnalysis()
        alert(`Successfully fetched ${result.updated} abstracts!${result.failed > 0 ? ` ${result.failed} papers failed to fetch abstracts.` : ''}`)
      } else if (result.failed > 0) {
        alert(`Failed to fetch abstracts for ${result.failed} papers. They may not be available in PubMed.`)
      } else {
        alert('No papers without abstracts found.')
      }
    } catch (error: any) {
      console.error('Error fetching abstracts:', error)
      alert(`Failed to fetch abstracts: ${error.message}`)
    } finally {
      setFetchingAbstracts(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading papers for AI analysis...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Analysis Preparation
          </CardTitle>
          <CardDescription>
            Papers ready for AI analysis using abstracts from PubMed
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{papers.length}</div>
            <div className="text-xs text-muted-foreground">Papers Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground">Ready for Analysis</div>
          </CardContent>
        </Card>
      </div>

      {/* Papers Ready for Analysis */}
      {papers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Ready for AI Analysis ({papers.length})
            </CardTitle>
            <CardDescription>
              All papers have abstracts available for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={runAIAnalysis}
                  disabled={analyzing || papers.length === 0}
                  className="flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      {hasExistingAnalysis ? 'Re-run Analysis' : 'Analyze with AI'} ({papers.length} papers)
                    </>
                  )}
                </Button>
                
                {hasExistingAnalysis && analysisDate && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 px-2 py-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Last analyzed: {new Date(analysisDate).toLocaleDateString()}
                  </div>
                )}
                
                <Button
                  onClick={handleFetchAbstracts}
                  disabled={fetchingAbstracts}
                  variant="outline"
                  size="sm"
                >
                  {fetchingAbstracts ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Brain className="h-3 w-3 mr-2" />
                      Fetch Missing Abstracts
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {papers.slice(0, 5).map(paper => (
              <div key={paper.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">
                      {paper.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        PMID: {paper.pmid}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-blue-700">
                        Abstract Available
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {getAbstractPreview(paper.abstract)}
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on PubMed
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {papers.length > 5 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                ... and {papers.length - 5} more papers ready for analysis
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Charts */}
      {chartData && (
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Research Analytics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Publication Timeline */}
            {chartData.publicationYears && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Publication Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'axis' },
                      xAxis: {
                        type: 'category',
                        data: chartData.publicationYears.map((item: any) => item.year),
                        axisLabel: { fontSize: 10 }
                      },
                      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                      series: [{
                        data: chartData.publicationYears.map((item: any) => item.count),
                        type: 'line',
                        smooth: true,
                        itemStyle: { color: '#3b82f6' },
                        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
                      }],
                      grid: { left: 30, right: 20, top: 20, bottom: 30 }
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Study Types Distribution */}
            {chartData.studyTypes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Study Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'item' },
                      series: [{
                        type: 'pie',
                        radius: '70%',
                        data: chartData.studyTypes.map((item: any) => ({
                          value: item.count,
                          name: item.type
                        })),
                        emphasis: {
                          itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                          }
                        },
                        label: { fontSize: 10 }
                      }]
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Research Themes */}
            {chartData.researchThemes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Research Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                      xAxis: {
                        type: 'value',
                        axisLabel: { fontSize: 10 }
                      },
                      yAxis: {
                        type: 'category',
                        data: chartData.researchThemes.map((item: any) => item.theme),
                        axisLabel: { fontSize: 9, interval: 0 }
                      },
                      series: [{
                        data: chartData.researchThemes.map((item: any) => item.count),
                        type: 'bar',
                        itemStyle: { color: '#10b981' }
                      }],
                      grid: { left: 80, right: 20, top: 20, bottom: 30 }
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Sample Sizes */}
            {chartData.sampleSizes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sample Size Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                      xAxis: {
                        type: 'category',
                        data: chartData.sampleSizes.map((item: any) => item.range),
                        axisLabel: { fontSize: 10, rotate: 45 }
                      },
                      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                      series: [{
                        data: chartData.sampleSizes.map((item: any) => item.count),
                        type: 'bar',
                        itemStyle: { color: '#f59e0b' }
                      }],
                      grid: { left: 30, right: 20, top: 20, bottom: 60 }
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quality Assessment */}
            {chartData.qualityScores && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Study Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'item' },
                      series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        data: chartData.qualityScores.map((item: any) => ({
                          value: item.count,
                          name: item.quality,
                          itemStyle: {
                            color: item.quality === 'High Quality' ? '#10b981' :
                                   item.quality === 'Medium Quality' ? '#f59e0b' : '#ef4444'
                          }
                        })),
                        label: { fontSize: 10 }
                      }]
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Geographic Distribution */}
            {chartData.geographicRegions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts
                    option={{
                      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                      xAxis: {
                        type: 'category',
                        data: chartData.geographicRegions.map((item: any) => item.region),
                        axisLabel: { fontSize: 10, rotate: 30 }
                      },
                      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                      series: [{
                        data: chartData.geographicRegions.map((item: any) => item.count),
                        type: 'bar',
                        itemStyle: { color: '#8b5cf6' }
                      }],
                      grid: { left: 30, right: 20, top: 20, bottom: 50 }
                    }}
                    style={{ height: '200px', width: '100%' }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {(aiAnalysis || analysisError) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Analysis Results
            </CardTitle>
            {analysisError && (
              <CardDescription className="text-red-600">
                Analysis failed: {analysisError}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {aiAnalysis && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-sm leading-relaxed font-sans [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:first:mt-0 [&>h3]:text-base [&>h3]:font-medium [&>h3]:text-gray-800 [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:ml-4 [&>ul]:mb-3 [&>li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: aiAnalysis }}
                  />
                </div>
              </div>
            )}
            {analysisError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  {analysisError === 'OpenAI API quota exceeded. Please check your billing.' ? (
                    <>
                      <strong>API Quota Exceeded:</strong> Your OpenAI account has reached its usage limit. 
                      Please check your billing settings in your OpenAI dashboard.
                    </>
                  ) : analysisError === 'Invalid OpenAI API key. Please check your configuration.' ? (
                    <>
                      <strong>Invalid API Key:</strong> Please make sure you've added your OpenAI API key 
                      to the .env.local file as OPENAI_API_KEY=your_key_here
                    </>
                  ) : (
                    <>
                      <strong>Analysis Error:</strong> {analysisError}. Please try again.
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {papers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Summary</CardTitle>
            <CardDescription>
              Overview of your paper collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{papers.length}</div>
                  <div className="text-xs text-muted-foreground">Papers Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {papers.filter(p => p.abstract && p.abstract.length > 500).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Rich Abstracts (&gt;500 chars)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(papers.reduce((sum, p) => sum + (p.abstract?.length || 0), 0) / papers.length) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Abstract Length</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {papers.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Papers Ready for Analysis
            </CardTitle>
            <CardDescription>
              Papers need abstracts for AI analysis. You can:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground mb-4">
              • Add papers from search that include abstracts<br/>
              • Import CSV files (abstracts will be fetched automatically)<br/>
              • Fetch abstracts for existing papers without them
            </div>
            
            <Button 
              onClick={handleFetchAbstracts}
              disabled={fetchingAbstracts}
              variant="outline"
              className="w-full"
            >
              {fetchingAbstracts ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Abstracts from PubMed...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Fetch Missing Abstracts
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              This will fetch abstracts from PubMed for any papers in this project that don't have them
            </p>
          </CardContent>
        </Card>
      )}


    </div>
  )
}