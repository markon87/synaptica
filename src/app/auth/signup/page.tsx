import SignUpForm from "@/components/auth/SignUpForm"
import Logo from "@/components/Logo"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Link href="/">
            <Logo width={160} height={40} />
          </Link>
        </div>
        
        <SignUpForm />
        
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}