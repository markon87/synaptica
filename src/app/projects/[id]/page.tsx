"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/providers/AuthProvider"
import { useQuery } from "@tanstack/react-query"
import { getProject } from "@/lib/supabase/projects"
import { getProjectPapers, removePaperFromProject } from "@/lib/supabase/papers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CSVImportModal } from "@/components/projects/CSVImportModal"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Edit3, 
  Trash2, 
  Search, 
  FileText, 
  Plus,
  FolderOpen,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react"

export default function ProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const papersPerPage = 5
  
  // CSV Import modal state
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectId, user?.id],
    queryFn: () => getProject(projectId, user!.id),
    enabled: !!user && !!projectId,
  })

  const { data: papers, isLoading: papersLoading, refetch: refetchPapers } = useQuery({
    queryKey: ["project-papers", projectId, user?.id],
    queryFn: () => getProjectPapers(projectId, user!.id),
    enabled: !!user && !!projectId,
  })

  // Pagination calculations
  const totalPages = papers ? Math.ceil(papers.length / papersPerPage) : 0
  const startIndex = (currentPage - 1) * papersPerPage
  const endIndex = startIndex + papersPerPage
  const currentPapers = papers ? papers.slice(startIndex, endIndex) : []

  // Reset to page 1 when papers change
  useEffect(() => {
    if (papers && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [papers, currentPage, totalPages])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, router])

  const handleRemovePaper = async (paperId: string) => {
    if (!user || !project) return
    
    try {
      await removePaperFromProject(project.id, paperId, user.id)
      refetchPapers()
      // If current page becomes empty after removal, go to previous page
      if (currentPapers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (err) {
      console.error('Error removing paper:', err)
      // Could show error toast here
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error or not found
  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-destructive text-xl mb-2">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This project doesn't exist or you don't have permission to view it.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/projects">View All Projects</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold gradient-brand-text mb-2 break-words">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground text-lg mb-3 break-words">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                {project.updated_at !== project.created_at && (
                  <div className="flex items-center gap-1">
                    <Edit3 className="h-4 w-4" />
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <Button variant="outline" size="sm" disabled>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{papers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Saved Papers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Notes Added</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.ceil((new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Papers Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Saved Papers</CardTitle>
                  <CardDescription>Research papers saved to this project</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCSVImportOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/search" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Papers
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {papersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
                </div>
              ) : papers && papers.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {currentPapers.map((paper) => (
                      <div key={paper.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-snug mb-2">
                              {paper.title}
                            </h4>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>
                                <span className="font-medium">Authors:</span>{' '}
                                {Array.isArray(paper.authors) ? paper.authors.slice(0, 3).join(', ') : 'No authors listed'}
                                {Array.isArray(paper.authors) && paper.authors.length > 3 ? ' et al.' : ''}
                              </p>
                              <p>
                                <span className="font-medium">Journal:</span> {paper.journal}
                              </p>
                              <p>
                                <span className="font-medium">Published:</span> {paper.pub_date}
                              </p>
                              <p>
                                <span className="font-medium">Saved:</span> {new Date(paper.saved_at).toLocaleDateString()}
                              </p>
                              {paper.notes && (
                                <p>
                                  <span className="font-medium">Notes:</span> {paper.notes}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 underline"
                              >
                                View on PubMed
                              </a>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePaper(paper.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              title="Remove from project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, papers.length)} of {papers.length} papers
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="min-w-[2rem]"
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">No papers saved yet</h3>
                  <p className="text-sm mb-6 max-w-md mx-auto">
                    Start building your research collection by searching PubMed and saving relevant papers to this project.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <Link href="/search" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search PubMed
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsCSVImportOpen(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search & Add Papers
                </Link>
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setIsCSVImportOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV from PubMed
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Project Details
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Export Project
              </Button>
            </CardContent>
          </Card>

          {/* Project Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Add notes to track your research progress</p>
                <Button variant="outline" size="sm" className="mt-3" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">Activity will appear as you work on your project</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        projectId={projectId}
        onImportComplete={() => {
          refetchPapers()
          setIsCSVImportOpen(false)
        }}
      />
    </div>
  )
}