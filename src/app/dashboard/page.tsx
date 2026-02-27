"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FolderPlus, Search, FileText, BarChart3, Folder, Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserProjects } from "@/lib/supabase/projects"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectName, setCreatedProjectName] = useState<string | null>(null)

  // Fetch user's projects
  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getUserProjects(user!.id),
    enabled: !!user,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // Check for success message from project creation
  useEffect(() => {
    const created = searchParams.get('created')
    if (created) {
      setCreatedProjectName(created)
      setShowSuccess(true)
      // Refetch projects to show the new one
      refetchProjects()
      // Remove the query parameter from URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams, refetchProjects])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-brand-text">
          Welcome back, {user.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Your biomedical research dashboard
        </p>
        
        {/* Success Message */}
        {showSuccess && createdProjectName && (
          <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-green-600">✅</div>
              <p className="text-green-800 font-medium">
                Project "{createdProjectName}" created successfully!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Search Literature</CardTitle>
            <CardDescription className="text-sm mb-3">
              Find the latest publications
            </CardDescription>
            <Button asChild size="sm" className="w-full">
              <Link href="/search">Start Search</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-accent/10">
                <FolderPlus className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">New Project</CardTitle>
            <CardDescription className="text-sm mb-3">
              Create a research project
            </CardDescription>
            <Button asChild size="sm" className="w-full">
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">AI Extraction</CardTitle>
            <CardDescription className="text-sm mb-3">
              Extract structured data
            </CardDescription>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Evidence Dashboard</CardTitle>
            <CardDescription className="text-sm mb-3">
              Visualize your research
            </CardDescription>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}