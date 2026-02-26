"use client"

import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, Users, BookOpen, TrendingUp, PieChart } from "lucide-react"
import { Database } from "@/lib/supabase/types"

type Json = Database['public']['Tables']['papers']['Row']['authors']

interface PaperAnalytic {
  id: string
  pmid: string
  title: string
  authors: Json  // Changed from string[] to Json to match Supabase type
  journal: string
  pub_date: string
  abstract: string
  created_at: string
  notes?: string
  tags?: string[]
  saved_at: string
}

interface ProjectAnalyticsProps {
  papers: PaperAnalytic[]
  projectName: string
}

export function ProjectAnalytics({ papers, projectName }: ProjectAnalyticsProps) {
  // Publication Years Analysis
  const publicationYearsChart = useMemo(() => {
    if (!papers?.length) return null

    const yearCounts: { [key: string]: number } = {}
    papers.forEach(paper => {
      const year = paper.pub_date?.match(/\d{4}/)?.[0] || 'Unknown'
      yearCounts[year] = (yearCounts[year] || 0) + 1
    })

    const sortedYears = Object.entries(yearCounts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .filter(([year]) => year !== 'Unknown')

    return {
      title: {
        text: 'Papers by Publication Year',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: 'Year {b}: {c} papers'
      },
      xAxis: {
        type: 'category',
        data: sortedYears.map(([year]) => year),
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [{
        name: 'Papers',
        type: 'bar',
        data: sortedYears.map(([, count]) => count),
        itemStyle: {
          color: '#3B82F6'
        },
        emphasis: {
          itemStyle: {
            color: '#1D4ED8'
          }
        }
      }],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '20%',
        top: '15%'
      }
    }
  }, [papers])

  // Top Journals Analysis
  const topJournalsChart = useMemo(() => {
    if (!papers?.length) return null

    const journalCounts: { [key: string]: number } = {}
    papers.forEach(paper => {
      const journal = paper.journal?.trim() || 'Unknown Journal'
      journalCounts[journal] = (journalCounts[journal] || 0) + 1
    })

    const topJournals = Object.entries(journalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return {
      title: {
        text: 'Top 10 Journals',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} papers'
      },
      xAxis: {
        type: 'value',
        minInterval: 1
      },
      yAxis: {
        type: 'category',
        data: topJournals.map(([journal]) => 
          journal.length > 30 ? journal.substring(0, 30) + '...' : journal
        ).reverse(),
        axisLabel: { 
          fontSize: 10,
          interval: 0
        }
      },
      series: [{
        name: 'Papers',
        type: 'bar',
        data: topJournals.map(([, count]) => count).reverse(),
        itemStyle: {
          color: '#10B981'
        },
        emphasis: {
          itemStyle: {
            color: '#047857'
          }
        }
      }],
      grid: {
        left: '45%',
        right: '10%',
        bottom: '10%',
        top: '15%'
      }
    }
  }, [papers])

  // Top Authors Analysis  
  const topAuthorsChart = useMemo(() => {
    if (!papers?.length) return null

    const authorCounts: { [key: string]: number } = {}
    papers.forEach(paper => {
      // Handle Json type - could be null, array, or other Json value
      const authors = paper.authors
      if (Array.isArray(authors)) {
        authors.slice(0, 5).forEach(author => { // Limit to first 5 authors per paper
          if (typeof author === 'string') {
            const cleanAuthor = author.trim()
            if (cleanAuthor && cleanAuthor.length > 2) {
              authorCounts[cleanAuthor] = (authorCounts[cleanAuthor] || 0) + 1
            }
          }
        })
      }
    })

    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)

    if (topAuthors.length === 0) return null

    return {
      title: {
        text: 'Most Frequent Authors',
        left: 'center',
        top: '0px',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} papers ({d}%)'
      },
      series: [{
        name: 'Authors',
        type: 'pie',
        radius: ['40%', '70%'],
        data: topAuthors.map(([author, count]) => ({
          value: count,
          name: author.length > 20 ? author.substring(0, 20) + '...' : author
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          fontSize: 10,
          formatter: (params: any) => {
            return params.percent >= 5 ? params.name : ''
          }
        }
      }]
    }
  }, [papers])

  // Research Timeline (when papers were saved)
  const researchTimelineChart = useMemo(() => {
    if (!papers?.length) return null

    const monthCounts: { [key: string]: number } = {}
    papers.forEach(paper => {
      if (paper.saved_at) {
        const date = new Date(paper.saved_at)
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
      }
    })

    const sortedMonths = Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))

    if (sortedMonths.length <= 1) return null

    return {
      title: {
        text: 'Research Collection Timeline',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: 'Month {b}: {c} papers added'
      },
      xAxis: {
        type: 'category',
        data: sortedMonths.map(([month]) => month),
        axisLabel: { rotate: 45, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [{
        name: 'Papers Added',
        type: 'line',
        smooth: true,
        data: sortedMonths.map(([, count]) => count),
        itemStyle: {
          color: '#8B5CF6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.0)' }
            ]
          }
        }
      }],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '20%',
        top: '15%'
      }
    }
  }, [papers])

  // Summary Stats
  const stats = useMemo(() => {
    if (!papers?.length) return null

    const uniqueJournals = new Set(papers.map(p => p.journal?.trim()).filter(Boolean)).size
    
    // Handle Json authors type properly
    const allAuthors = papers.flatMap(p => {
      const authors = p.authors
      if (Array.isArray(authors)) {
        return authors.filter((author): author is string => 
          typeof author === 'string' && author.trim().length > 2
        )
      }
      return []
    })
    const uniqueAuthors = new Set(allAuthors).size
    
    const yearRange = papers
      .map(p => parseInt(p.pub_date?.match(/\d{4}/)?.[0] || '0'))
      .filter(year => year > 0)
    
    const oldestYear = Math.min(...yearRange)
    const newestYear = Math.max(...yearRange)
    
    return {
      totalPapers: papers.length,
      uniqueJournals,
      uniqueAuthors,
      yearSpan: yearRange.length > 0 ? `${oldestYear} - ${newestYear}` : 'N/A'
    }
  }, [papers])

  if (!papers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Analytics
          </CardTitle>
          <CardDescription>
            Insights and visualizations will appear when you add papers to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p>No papers to analyze yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Analytics: {projectName}
          </CardTitle>
          <CardDescription>
            Visual insights from {stats?.totalPapers} papers in your research collection
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.totalPapers}</div>
              <div className="text-xs text-muted-foreground">Total Papers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats.uniqueJournals}</div>
              <div className="text-xs text-muted-foreground">Unique Journals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{stats.uniqueAuthors}</div>
              <div className="text-xs text-muted-foreground">Unique Authors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-bold">{stats.yearSpan}</div>
              <div className="text-xs text-muted-foreground">Year Range</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Publication Years */}
        {publicationYearsChart && (
          <Card>
            <CardContent className="p-4">
              <ReactECharts 
                option={publicationYearsChart} 
                style={{ height: '300px', width: '100%' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Top Journals */}
        {topJournalsChart && (
          <Card>
            <CardContent className="p-4">
              <ReactECharts 
                option={topJournalsChart} 
                style={{ height: '300px', width: '100%' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Top Authors */}
        {topAuthorsChart && (
          <Card>
            <CardContent className="p-4">
              <ReactECharts 
                option={topAuthorsChart} 
                style={{ height: '300px', width: '100%' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Research Timeline */}
        {researchTimelineChart && (
          <Card>
            <CardContent className="p-4">
              <ReactECharts 
                option={researchTimelineChart} 
                style={{ height: '300px', width: '100%' }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}