"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Compass, Heart, User, Sun, Moon, LogOut, ShieldAlert, ArrowLeftRight } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"
import { mockAuth, SessionUser } from "../lib/supabase"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<SessionUser | null>(null)

  // Listen to session changes
  useEffect(() => {
    const checkSession = () => {
      const activeSession = mockAuth.getSession()
      setUser(activeSession)
    }

    checkSession()
    // Poll session changes slightly to sync across logins/logouts
    const interval = setInterval(checkSession, 1500)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    mockAuth.logout()
    setUser(null)
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  // Don't show Navbar on login/signup pages
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md font-bold text-lg">
            CO
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            CoWorking Spaces
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/compare") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Compare</span>
          </Link>

          <Link
            href="/favorites"
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/favorites") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Favorites</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/profile") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Preferences</span>
          </Link>

          {user && user.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-red-500 ${
                isActive("/admin") ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-accent cursor-pointer"
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-300" />
            )}
          </Button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {user.role} Account
                </span>
              </div>
              
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase">
                  {user.name.charAt(0)}
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="shadow-sm font-semibold cursor-pointer">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
