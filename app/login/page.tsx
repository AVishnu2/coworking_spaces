"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { mockAuth } from "../../lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    const session = mockAuth.getSession()
    if (session) {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please fill in your email address.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { user, error } = await mockAuth.login(email, password)
      if (error) {
        setError(error)
      } else if (user) {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const { user, error } = await mockAuth.googleLogin()
      if (error) {
        setError(error)
      } else if (user) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Google authentication failed.")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background/20">
      <Card className="w-full max-w-md border border-border bg-card/75 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg">
            CO
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-border bg-background/50 pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setError("For the mock prototype, any email works! Simply fill in your email and hit Sign In.")}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-background/50 pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold shadow-lg mt-2 cursor-pointer"
              disabled={loading || googleLoading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <span className="absolute w-full border-t border-border" />
            <span className="relative bg-card/90 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              "Loading Google Auth..."
            ) : (
              <span className="flex items-center justify-center space-x-2">
                {/* SVG Google Icon */}
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.177-2.767-6.177-6.177 0-3.41 2.767-6.177 6.177-6.177 1.583 0 3.018.601 4.114 1.583l3.056-3.056C19.06 1.77 15.836.8 12.24.8 5.952.8.85 5.902.85 12.19s5.102 11.39 11.39 11.39c6.48 0 11.534-4.56 11.534-11.534 0-.712-.064-1.393-.194-2.073h-11.34Z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
