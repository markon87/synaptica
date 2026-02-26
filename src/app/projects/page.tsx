"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useQuery } from "@tanstack/react-query"
import { getUserProjects } from "@/lib/supabase/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FolderPlus, Folder, Calendar } from "lucide-react"

export default function ProjectsPage() {
  const { user } = useAuth()
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getUserProjects(user!.id),
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">🔒</div>
            <p className="text-muted-foreground mb-4">Please log in to view your projects</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-brand-text">
            My Projects
          </h1>
          <p className="text-muted-foreground">
            Manage your research projects and saved papers
          </p>
        </div>
        
        <Button asChild>
          <Link href="/projects/new" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-destructive text-xl mb-2">⚠️ Error</div>
            <p className="text-muted-foreground">Failed to load projects. Please try again.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects && projects.length === 0 && !isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <FolderPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first research project to organize papers, notes, and findings in one place.
            </p>
            <Button asChild size="lg">
              <Link href="/projects/new" className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects && projects.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {project.name}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {project.description && (
                    <CardDescription className="text-sm mb-3 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/projects/${project.id}`}>
                      View Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length === 1 ? '' : 's'} total
            </p>
          </div>
        </>
      )}
    </div>
  )
}