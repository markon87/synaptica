"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/AuthProvider"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { createProject } from "@/lib/supabase/projects"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FolderPlus } from "lucide-react"

export default function NewProjectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleCreateProject = async (data: { name: string; description: string }) => {
    if (!user) {
      setError("You must be logged in to create a project")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const project = await createProject(
        data.name,
        data.description || null,
        user.id
      )
      
      // Redirect to the project page (we'll create this later)
      // For now, redirect to dashboard with success message
      router.push(`/dashboard?created=${encodeURIComponent(project.name)}`)
      
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">🔒</div>
            <p className="text-muted-foreground mb-4">Please log in to create a project</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <FolderPlus className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl font-bold gradient-brand-text">
            Create New Project
          </h1>
        </div>
        <p className="text-muted-foreground">
          Start a new research project to organize your literature and findings
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-destructive text-sm font-medium">Error</p>
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="flex justify-center">
        <ProjectForm 
          onSubmit={handleCreateProject}
          isLoading={isLoading}
          submitLabel="Create Project"
        />
      </div>

      {/* Tips */}
      <div className="mt-12 max-w-md mx-auto">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
          💡 Project Tips
        </h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li>• Choose a clear, descriptive name for your research project</li>
          <li>• Add a description to help you remember the project's goals</li>
          <li>• You can save papers from PubMed searches to your projects</li>
          <li>• Projects help you organize and track your research progress</li>
        </ul>
      </div>
    </div>
  )
}