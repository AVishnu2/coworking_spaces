"use server"

import { cookies } from "next/headers"
import { dbService } from "../lib/dbService"
import { getRecommendationExplanation } from "../lib/gemini"
import { Workspace, Review } from "../types"

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

export async function searchWorkspaces(filters?: any) {
  return await dbService.getWorkspaces(filters)
}

export async function getWorkspaceDetails(id: string) {
  return await dbService.getWorkspaceById(id)
}

export async function toggleFavoriteAction(workspaceId: string): Promise<boolean> {
  const userId = await getActiveUserId()
  return await dbService.toggleFavorite(userId, workspaceId)
}

export async function isFavoriteAction(workspaceId: string): Promise<boolean> {
  const userId = await getActiveUserId()
  const favs = await dbService.getFavorites(userId)
  return favs.some(w => w.id === workspaceId)
}

export async function getRecommendationExplanationAction(workspaceId: string, preferredBudget?: number): Promise<string> {
  const workspace = await dbService.getWorkspaceById(workspaceId)
  if (!workspace) return "Workspace not found."
  return await getRecommendationExplanation(workspace, preferredBudget)
}

export async function submitReview(workspaceId: string, rating: number, comment: string): Promise<Review> {
  const userId = await getActiveUserId()
  
  // Extract pros/cons from comment keywords
  const commentLower = comment.toLowerCase()
  const pros: string[] = []
  const cons: string[] = []

  if (commentLower.includes("wifi") || commentLower.includes("internet")) {
    if (commentLower.includes("fast") || commentLower.includes("speed") || commentLower.includes("great")) {
      pros.push("Fast WiFi")
    } else if (commentLower.includes("slow") || commentLower.includes("drop") || commentLower.includes("bad")) {
      cons.push("WiFi issues")
    }
  }

  if (commentLower.includes("quiet") || commentLower.includes("silent") || commentLower.includes("peaceful")) {
    pros.push("Quiet workspace")
  } else if (commentLower.includes("noise") || commentLower.includes("loud") || commentLower.includes("noisy")) {
    cons.push("Noisy environment")
  }

  if (commentLower.includes("clean") || commentLower.includes("tidy") || commentLower.includes("hygiene")) {
    pros.push("Clean premises")
  }

  if (commentLower.includes("staff") || commentLower.includes("people") || commentLower.includes("host")) {
    if (commentLower.includes("friendly") || commentLower.includes("helpful") || commentLower.includes("nice")) {
      pros.push("Friendly staff")
    }
  }

  if (commentLower.includes("parking")) {
    if (commentLower.includes("easy") || commentLower.includes("good")) {
      pros.push("Dedicated parking")
    } else {
      cons.push("Parking limitations")
    }
  }

  if (commentLower.includes("price") || commentLower.includes("expensive") || commentLower.includes("cost")) {
    if (commentLower.includes("cheap") || commentLower.includes("affordable") || commentLower.includes("reasonable")) {
      pros.push("Affordable rates")
    } else {
      cons.push("Premium pricing")
    }
  }

  // Fallbacks if nothing detected
  if (pros.length === 0) pros.push(rating >= 4 ? "Good facilities" : "Reasonable desk setup")
  if (cons.length === 0 && rating <= 3) cons.push("Minor structural noise")

  return await dbService.createReview({
    userId,
    workspaceId,
    rating,
    comment,
    pros,
    cons
  })
}
