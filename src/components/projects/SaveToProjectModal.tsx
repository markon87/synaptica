"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUserProjects } from "@/lib/supabase/projects"
import { savePaperToProject, PaperData } from "@/lib/supabase/papers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  FolderPlus, 
  Folder, 
  Calendar, 
  Check,
  AlertCircle,
  Plus
} from "lucide-react"

interface SaveToProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paperData: PaperData
  onSuccess?: () => void
}

export function SaveToProjectModal({ 
  open, 
  onOpenChange, 
  paperData,
  onSuccess 
}: SaveToProjectModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getUserProjects(user!.id),
    enabled: !!user && open,
  })

  const handleSave = async () => {
    if (!selectedProjectId || !user) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('Saving paper to project:', {
        projectId: selectedProjectId,
        paperData,
        userId: user.id
      })

      await savePaperToProject(selectedProjectId, paperData, user.id)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project-papers"] })
      
      setSuccess(true)
      onSuccess?.()
      
      // Auto close after success
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setSelectedProjectId(null)
      }, 1500)
      
    } catch (err) {
      console.error('Error saving paper:', err)
      const errorMessage = err instanceof Error ? err.message : "Failed to save paper"
      setError(`Save failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedProjectId(null)
    setError(null)
    setSuccess(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Save to Project
          </DialogTitle>
          <DialogDescription>
            Choose a project to save "{paperData.title.substring(0, 50)}..."
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive font-medium">Error</p>
            </div>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800 font-medium">Paper saved successfully!</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {projectsLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          </div>
        )}

        {/* Projects List */}
        {projects && !projectsLoading && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-2">No projects found</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/projects/new" onClick={() => handleClose()}>
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <Card 
                    key={project.id}
                    className={`cursor-pointer transition-colors ${
                      selectedProjectId === project.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${
                          selectedProjectId === project.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {project.name}
                          </h4>
                          {project.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {selectedProjectId === project.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Create New Project Option */}
                <Card className="cursor-pointer hover:bg-muted/50 border-dashed">
                  <CardContent className="p-3">
                    <Button asChild variant="ghost" className="w-full justify-start h-auto p-0">
                      <Link href="/projects/new" onClick={() => handleClose()}>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-accent/10">
                            <Plus className="h-4 w-4 text-accent" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">Create New Project</p>
                            <p className="text-xs text-muted-foreground">
                              Start a new research project
                            </p>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {projects && projects.length > 0 && (
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedProjectId || isLoading}
            >
              {isLoading ? "Saving..." : "Save Paper"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}