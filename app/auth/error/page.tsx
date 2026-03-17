import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Authentication Error</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Something went wrong during authentication. Please try again or contact support if the problem persists.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/login">
            <Button>Back to Sign In</Button>
          </Link>
          <Link href="/support">
            <Button variant="outline">Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
