"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Search, ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import WorkspaceCard from "../../components/workspace/WorkspaceCard"
import { getFavoriteWorkspacesAction } from "../../actions/profile"
import { Workspace } from "../../types"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    try {
      const data = await getFavoriteWorkspacesAction()
      setFavorites(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading saved favorites...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link href="/dashboard" className="inline-flex items-center space-x-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="border-b border-border/40 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
          <Heart className="h-6 w-6 text-red-500 fill-red-500 mr-2" />
          Saved Workspaces
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Your curated list of preferred coworking spaces.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(ws => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-dashed border-2 border-border/60 rounded-xl bg-card/10 max-w-lg mx-auto">
          <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h3 className="font-extrabold text-base text-foreground mt-4">No Saved Workspaces</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Workspaces you favorite on the dashboard will appear here for quick access.
          </p>
          <Link href="/dashboard" className="inline-block mt-6">
            <Button size="sm" className="font-bold cursor-pointer">
              Explore Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
