"use server"

import { dbService } from "../lib/dbService"
import { Workspace } from "../types"

export async function addWorkspaceAction(data: Omit<Workspace, "id" | "createdAt" | "updatedAt" | "rating">) {
  return await dbService.createWorkspace(data)
}

export async function updateWorkspaceAction(id: string, data: Partial<Workspace>) {
  return await dbService.updateWorkspace(id, data)
}

export async function deleteWorkspaceAction(id: string) {
  return await dbService.deleteWorkspace(id)
}

export async function getAllBookingsAction() {
  return await dbService.getAllBookings()
}

export async function updateBookingStatusAction(id: string, status: string) {
  return await dbService.updateBookingStatus(id, status)
}

export async function deleteReviewAction(id: string) {
  return await dbService.deleteReview(id)
}
