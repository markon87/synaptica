"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function FeaturesPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Powerful Features for Modern Research
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform weeks of literature review into hours of insights with AI-powered research tools 
            designed for biomedical professionals.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gradient-brand text-white border-0">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/search">Try Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">Core Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for comprehensive literature review and research synthesis
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">🤖</div>
                <CardTitle className="text-foreground">AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced machine learning algorithms automatically extract study characteristics, 
                  methodologies, and key findings from research papers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Extract sample sizes & demographics</li>
                  <li>• Identify study designs & outcomes</li>
                  <li>• Categorize interventions & results</li>
                  <li>• Quality assessment indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">🔍</div>
                <CardTitle className="text-foreground">Smart PubMed Integration</CardTitle>
                <CardDescription>
                  Enhanced search capabilities with automatic medical term correction and 
                  intelligent query optimization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Auto-correct "CAR T" → "CAR-T"</li>
                  <li>• Fix T-cell terminology</li>
                  <li>• Fallback search strategies</li>
                  <li>• Relevance-based sorting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">🔓</div>
                <CardTitle className="text-foreground">Open Access Priority</CardTitle>
                <CardDescription>
                  Automatically identify and prioritize free full-text papers from 
                  PMC and other open access repositories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• 7+ million PMC papers</li>
                  <li>• DOI resolution for free access</li>
                  <li>• Deep analysis on full-text</li>
                  <li>• Clear access indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle className="text-foreground">Cross-Paper Insights</CardTitle>
                <CardDescription>
                  Identify research patterns, gaps, and trends across hundreds of 
                  studies with intelligent synthesis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Publication trend analysis</li>
                  <li>• Geographic distribution maps</li>
                  <li>• Methodology breakdowns</li>
                  <li>• Research gap identification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">⚡</div>
                <CardTitle className="text-foreground">CSV Bulk Import</CardTitle>
                <CardDescription>
                  Upload hundreds of papers from PubMed exports with intelligent 
                  column mapping and instant processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Drag & drop CSV files</li>
                  <li>• Smart column detection</li>
                  <li>• Duplicate identification</li>
                  <li>• Bulk project assignment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">📈</div>
                <CardTitle className="text-foreground">Publication-Ready Outputs</CardTitle>
                <CardDescription>
                  Generate PRISMA flow charts, evidence tables, and manuscript 
                  sections automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• PRISMA flow generation</li>
                  <li>• Evidence synthesis tables</li>
                  <li>• Reference management export</li>
                  <li>• Manuscript draft sections</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold gradient-brand-text mb-12">Research Impact</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-2">
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <CardTitle className="text-lg">Time Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average time saved on literature screening and analysis
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-2">
                <div className="text-4xl font-bold text-primary mb-2">3x</div>
                <CardTitle className="text-lg">More Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Increase in papers analyzed per research project
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-2">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <CardTitle className="text-lg">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Maintained research quality and methodological rigor
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-2">
                <div className="text-4xl font-bold text-primary mb-2">50%</div>
                <CardTitle className="text-lg">Faster Publication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Accelerated timeline from research to publication
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Workflow */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple 5-step process to transform your research workflow
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-card rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Create Research Project</h3>
                <p className="text-muted-foreground">
                  Choose from systematic review, meta-analysis, or literature survey templates. Define research questions and inclusion criteria.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-card rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Import Papers</h3>
                <p className="text-muted-foreground">
                  Search PubMed directly with enhanced term correction or upload CSV exports. Smart processing ensures comprehensive coverage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-card rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing</h3>
                <p className="text-muted-foreground">
                  Automatic screening, categorization, and data extraction. Deep analysis for open access papers, abstract insights for all others.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-card rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Review & Refine</h3>
                <p className="text-muted-foreground">
                  Focus expert attention on AI-flagged papers needing manual review. Accept, modify, or reject AI suggestions with confidence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-card rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Generate Insights</h3>
                <p className="text-muted-foreground">
                  Export publication-ready outputs including PRISMA charts, evidence tables, and manuscript sections. Identify future research directions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">Who We Serve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering researchers across academia, healthcare, and industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🎓</div>
                <CardTitle className="text-lg">PhD Students & Postdocs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Accelerate dissertation research and comprehensive exams. Focus on analysis instead of data collection.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🔬</div>
                <CardTitle className="text-lg">Clinical Researchers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build evidence bases for grants, protocols, and practice guidelines with systematic rigor.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🏥</div>
                <CardTitle className="text-lg">Healthcare Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Rapidly synthesize evidence for clinical decision support and policy development.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📚</div>
                <CardTitle className="text-lg">Academic Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Empower faculty and students with cutting-edge research tools. Institutional licenses available.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-brand-text mb-4">Built with Modern Technology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reliable, scalable, and secure platform powered by industry-leading technologies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">🚀 Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Next.js 16</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">TanStack Query</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">TypeScript</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Lightning-fast React framework with server-side rendering and optimized data fetching.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">🔒 Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Supabase</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Row Level Security</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">OAuth</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Enterprise-grade database with built-in authentication and real-time capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">🔗 Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">PubMed API</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">PMC API</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">DOI Resolution</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Seamless integration with leading biomedical databases and publishing platforms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Your Research?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join researchers who are already saving 85% of their literature review time with Synaptica's AI-powered platform.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gradient-brand text-white border-0">
              <Link href="/auth/signin">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/search">Try Demo</Link>
            </Button>
          </div>

          <div className="mt-8 p-6 bg-card/50 rounded-lg border border-border/50 max-w-2xl mx-auto">
            <p className="text-lg italic text-muted-foreground mb-3">
              "What used to take 6 months of manual screening now takes 2 weeks with Synaptica. 
              I can focus on the science instead of administrative tasks."
            </p>
            <p className="text-sm text-muted-foreground">— Dr. Sarah Chen, Systematic Review Researcher</p>
          </div>
        </div>
      </section>
    </div>
  )
}