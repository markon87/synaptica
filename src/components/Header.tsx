"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo, { LogoIcon } from "@/components/Logo"
import { useAuth } from "@/components/providers/AuthProvider"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, FolderOpen, Folder } from "lucide-react"

export default function Header() {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/projects" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Projects
                </Link>
                <Link 
                  href="/search" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Search
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/features" 
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
                  href="/search" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Search PubMed
                </Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/projects" className="cursor-pointer">
                      <Folder className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}