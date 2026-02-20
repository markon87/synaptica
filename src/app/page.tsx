import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Synaptica
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your biomedical research platform powered by TanStack Query & Table. 
            Streamline your research workflows with modern data visualization and analysis tools.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/test">View Demo</Link>
            </Button>
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed for modern biomedical research
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
                  Real-time updates and background refresh keep your data current.
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
                  Handle large datasets with ease and precision.
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
                  Responsive design that works on all devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with your research in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Data</h3>
              <p className="text-gray-600">
                Connect to your research databases, APIs, or upload datasets directly to the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visualize & Analyze</h3>
              <p className="text-gray-600">
                Use our powerful table and visualization tools to explore, sort, and filter your data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Results</h3>
              <p className="text-gray-600">
                Export your findings, generate reports, and share insights with your research team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader className="text-center">
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
          </div>
        </div>
      </section>
    </div>
  );
}
