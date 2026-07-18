"use server"

import { cookies } from "next/headers"
import { dbService } from "../lib/dbService"
import { Booking } from "../types"

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

export async function createBookingAction(data: {
  workspaceId: string
  date: string
  time: string
  teamSize: number
  purpose: string
}): Promise<Booking> {
  const userId = await getActiveUserId()
  return await dbService.createBooking({
    userId,
    workspaceId: data.workspaceId,
    date: new Date(data.date).toISOString(),
    time: data.time,
    teamSize: data.teamSize,
    purpose: data.purpose
  })
}

export async function getUserBookings(): Promise<Booking[]> {
  const userId = await getActiveUserId()
  return await dbService.getBookings(userId)
}

export async function cancelBookingAction(id: string): Promise<boolean> {
  // Update status to Cancelled instead of deleting, or delete record
  return await dbService.updateBookingStatus(id, "Cancelled")
}
