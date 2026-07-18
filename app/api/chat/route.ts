import { NextRequest, NextResponse } from "next/server"
import { getChatbotResponse } from "../../../lib/gemini"
import { dbService } from "../../../lib/dbService"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 1. Fetch all workspaces to provide context to the chatbot
    const { workspaces } = await dbService.getWorkspaces()

    // 2. Call the AI chatbot assistant
    const chatResponse = await getChatbotResponse(message, history || [], workspaces)

    return NextResponse.json(chatResponse)
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to process chat message" },
      { status: 500 }
    )
  }
}
