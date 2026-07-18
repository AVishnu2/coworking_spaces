import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Lazy creation of supabase client
export const supabase = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface SessionUser {
  id: string
  email: string
  name: string
  photoUrl: string | null
  role: 'admin' | 'user'
}

// Client-side Session Cache (simulated Cookie / LocalStorage auth)
class MockAuthClient {
  private SESSION_KEY = "coworkiq_session"

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  private setCookie(name: string, value: string, days: number = 7) {
    if (typeof document === "undefined") return
    let expires = ""
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"
  }

  private eraseCookie(name: string) {
    if (typeof document === "undefined") return
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  }

  public getSession(): SessionUser | null {
    // Check cookies first (so server-side next actions can read it)
    const cookieSession = this.getCookie(this.SESSION_KEY)
    if (cookieSession) {
      try {
        const session = JSON.parse(decodeURIComponent(cookieSession)) as SessionUser
        if (session.name === "CoWorkIQ Admin" || session.email === "admin@coworkiq.com") {
          session.name = "CoWorking Spaces Admin"
          session.email = "admin@coworkingspaces.com"
          this.setCookie(this.SESSION_KEY, encodeURIComponent(JSON.stringify(session)))
          if (typeof window !== "undefined") {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
          }
        }
        return session
      } catch (e) {
        return null
      }
    }

    // Check localStorage fallback
    if (typeof window !== "undefined") {
      const lsSession = localStorage.getItem(this.SESSION_KEY)
      if (lsSession) {
        try {
          const session = JSON.parse(lsSession) as SessionUser
          if (session.name === "CoWorkIQ Admin" || session.email === "admin@coworkiq.com") {
            session.name = "CoWorking Spaces Admin"
            session.email = "admin@coworkingspaces.com"
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
          }
          // sync to cookie
          this.setCookie(this.SESSION_KEY, encodeURIComponent(JSON.stringify(session)))
          return session
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  public async login(email: string, password?: string): Promise<{ user: SessionUser | null; error: string | null }> {
    // If Supabase is active, we would normally use supabase.auth.signInWithPassword
    // For universal mock/standard deployment, check mock profiles
    const cleanEmail = email.toLowerCase().trim()
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600))

    if (cleanEmail === "admin@coworkingspaces.com") {
      const sessionUser: SessionUser = {
        id: "user-mock-admin",
        email: "admin@coworkingspaces.com",
        name: "CoWorking Spaces Admin",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        role: "admin"
      }
      this.saveSession(sessionUser)
      return { user: sessionUser, error: null }
    }

    // Standard demo login
    const sessionUser: SessionUser = {
      id: "user-mock-demouser",
      email: cleanEmail,
      name: cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1),
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      role: "user"
    }

    this.saveSession(sessionUser)
    return { user: sessionUser, error: null }
  }

  public async signUp(email: string, name: string): Promise<{ user: SessionUser | null; error: string | null }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const cleanEmail = email.toLowerCase().trim()

    const sessionUser: SessionUser = {
      id: `user-mock-${Date.now()}`,
      email: cleanEmail,
      name,
      photoUrl: null,
      role: "user"
    }

    this.saveSession(sessionUser)
    return { user: sessionUser, error: null }
  }

  public async googleLogin(): Promise<{ user: SessionUser | null; error: string | null }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const sessionUser: SessionUser = {
      id: "user-mock-googleuser",
      email: "google.user@gmail.com",
      name: "Google Explorer",
      photoUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
      role: "user"
    }

    this.saveSession(sessionUser)
    return { user: sessionUser, error: null }
  }

  public logout() {
    this.eraseCookie(this.SESSION_KEY)
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }

  private saveSession(user: SessionUser) {
    const val = encodeURIComponent(JSON.stringify(user))
    this.setCookie(this.SESSION_KEY, val, 7)
    if (typeof window !== "undefined") {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
    }
  }
}

export const mockAuth = new MockAuthClient()
