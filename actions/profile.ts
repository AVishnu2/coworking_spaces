"use server"

import { cookies } from "next/headers"
import { dbService } from "../lib/dbService"
import { User, Workspace } from "../types"

// Helper to get active user ID from session cookies
async function getActiveUserId(): Promise<string> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("coworkiq_session")
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie.value))
      return user.id
    } catch (e) {}
  }
  return "user-mock-demouser" // Fallback
}

export async function getUserProfileAction(): Promise<User | null> {
  const userId = await getActiveUserId()
  return await dbService.getUserProfile(userId)
}

export async function updateUserProfileAction(data: Partial<User>): Promise<User | null> {
  const userId = await getActiveUserId()
  return await dbService.updateUserProfile(userId, data)
}

export async function getFavoriteWorkspacesAction(): Promise<Workspace[]> {
  const userId = await getActiveUserId()
  return await dbService.getFavorites(userId)
}

export async function syncUserProfile(email: string, name: string): Promise<User | null> {
  const userId = await getActiveUserId()
  const profile = await dbService.getUserProfile(userId)
  if (!profile) {
    return await dbService.updateUserProfile(userId, { email, name })
  }
  return profile
}
