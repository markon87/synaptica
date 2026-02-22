import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Logo from "@/components/Logo"

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <Logo width={200} height={50} />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Advanced Biomedical Research Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your research workflows with modern data visualization and analysis tools. 
            Powered by TanStack Query & Table for professional data management.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gradient-brand text-white border-0">
              <Link href="/search">View Demo</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for modern biomedical research
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Data Fetching</CardTitle>
                <CardDescription className="text-brand-blue font-medium">
                  Powered by TanStack Query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Efficient data fetching, caching, and synchronization for your research datasets.
                  Real-time updates and background refresh keep your data current.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-accent/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Data Tables</CardTitle>
                <CardDescription className="text-brand-pink font-medium">
                  Built with TanStack Table
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professional sortable tables with filtering, pagination, and advanced features.
                  Handle large datasets with ease and precision.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Modern UI</CardTitle>
                <CardDescription className="gradient-brand-text font-medium">
                  Styled with shadcn/ui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Beautiful, accessible components built on Radix UI and Tailwind CSS.
                  Responsive design that works on all devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with your research in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 gradient-brand text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Data</h3>
              <p className="text-muted-foreground">
                Connect to your research databases, APIs, or upload datasets directly to the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-brand text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Visualize & Analyze</h3>
              <p className="text-muted-foreground">
                Use our powerful table and visualization tools to explore, sort, and filter your data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-brand text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Share Results</h3>
              <p className="text-muted-foreground">
                Export your findings, generate reports, and share insights with your research team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Quick Search</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Search biomedical research data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input placeholder="Enter search terms..." className="border-border focus:ring-primary" />
                  <Button className="gradient-brand text-white border-0">Search</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
