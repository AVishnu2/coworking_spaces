"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, X, Send, Bot, User, Wifi, VolumeX, MapPin, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { ChatMessage, Workspace } from "../../types"

const QUICK_QUERIES = [
  "Need a space under ₹500 near Hitech City",
  "Need a quiet place for Zoom meetings",
  "Need a place for 10 people"
]

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I'm your CoWorking Spaces Assistant. Tell me what you're looking for, e.g. location, budget, team size, or quiet spaces, and I will recommend the best match!",
      createdAt: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Build history format expected by Gemini helper
    const history = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        parts: [m.text]
      }))

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history })
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()
      
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: data.text || "I found some spaces matching your criteria.",
        recommendedWorkspaces: data.recommendedWorkspaces || [],
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMsg])
    } catch (e) {
      console.error(e)
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: "bot",
        text: "Sorry, I had trouble retrieving matches. Please check your connection or try again.",
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <Card className="glass-panel mb-4 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-xl border border-border shadow-2xl transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-md">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Smart Assistant</h3>
                <p className="text-[10px] text-white/80">AI-Powered CoWorking Spaces Guide</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10 rounded-full h-8 w-8 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex w-full flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* Bubble Message */}
                <div className="flex items-start space-x-2 max-w-[85%]">
                  {msg.sender === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border text-foreground rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Recommended Spaces Cards */}
                {msg.recommendedWorkspaces && msg.recommendedWorkspaces.length > 0 && (
                  <div className="mt-3 pl-9 w-full space-y-2">
                    <p className="text-[10px] font-bold text-primary flex items-center space-x-1 uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
                      <span>Matching Spaces Found</span>
                    </p>
                    {msg.recommendedWorkspaces.slice(0, 3).map(ws => (
                      <Link 
                        key={ws.id} 
                        href={`/workspace/${ws.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <div className="glass-card hover:border-primary p-2.5 rounded-lg border border-border flex flex-col space-y-1.5 bg-card/90 cursor-pointer shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground truncate max-w-[70%]">{ws.name}</span>
                            <span className="font-extrabold text-[10px] text-primary">₹{ws.pricePerDay}/day</span>
                          </div>
                          
                          <p className="text-[10px] text-muted-foreground truncate flex items-center">
                            <MapPin className="h-3 w-3 mr-0.5 shrink-0" />
                            {ws.address.split(",")[2] || ws.address}
                          </p>

                          <div className="flex items-center space-x-2 text-[9px] pt-1">
                            <span className="flex items-center bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-1 rounded-sm">
                              <Wifi className="h-2.5 w-2.5 mr-0.5" />
                              {ws.wifiSpeed} Mbps
                            </span>
                            <span className="flex items-center bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1 rounded-sm">
                              <VolumeX className="h-2.5 w-2.5 mr-0.5" />
                              {ws.noiseLevel} Noise
                            </span>
                            <span className="text-muted-foreground ml-auto">⭐ {ws.rating}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-primary">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="bg-card border border-border rounded-xl rounded-tl-none p-3 shadow-sm flex items-center space-x-1 h-8">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce delay-200" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Suggestion Pills */}
          {messages.length === 1 && !loading && (
            <div className="p-3 border-t border-border/40 bg-background/50 space-y-1.5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Suggested Queries:</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[10px] bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary py-1 px-2.5 rounded-full cursor-pointer transition-colors max-w-full truncate text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-border bg-card">
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSend(input)
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about budget, wifi, quiet zones..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={loading}
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shrink-0 cursor-pointer"
                disabled={!input.trim() || loading}
              >
                <Send className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center cursor-pointer border border-white/10 group relative transition-transform active:scale-95"
        title="AI Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-primary text-[7px] text-white flex items-center justify-center font-bold">1</span>
          </div>
        )}
      </Button>
    </div>
  )
}
