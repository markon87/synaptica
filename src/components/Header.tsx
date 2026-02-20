import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo, { LogoIcon } from "@/components/Logo"

export default function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="md:hidden">
                <LogoIcon width={32} height={32} />
              </div>
              <div className="hidden md:block">
                <Logo width={140} height={35} />
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-muted-foreground hover:text-accent transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link 
              href="/test" 
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Search PubMed
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}