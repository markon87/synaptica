import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Synaptica
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your biomedical research platform powered by TanStack Query & Table
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/test">View Demo</Link>
            </Button>
            <Button variant="outline">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Data Fetching</CardTitle>
              <CardDescription>
                Powered by TanStack Query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Efficient data fetching, caching, and synchronization for your research datasets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Tables</CardTitle>
              <CardDescription>
                Built with TanStack Table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Professional sortable tables with filtering, pagination, and advanced features.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modern UI</CardTitle>
              <CardDescription>
                Styled with shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Beautiful, accessible components built on Radix UI and Tailwind CSS.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Quick Search</CardTitle>
            <CardDescription>
              Search biomedical research data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Enter search terms..." />
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
