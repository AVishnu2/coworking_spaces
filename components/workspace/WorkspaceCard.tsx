"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Wifi, VolumeX, MapPin, Heart, ArrowLeftRight, Calendar, Info, 
  Car, Coffee, Video, Sparkles 
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Workspace } from "../../types"
import { toggleFavoriteAction, isFavoriteAction } from "../../actions/workspaces"

interface WorkspaceCardProps {
  workspace: Workspace
  score?: number
  reasons?: string[]
  onBookClick?: (ws: Workspace) => void
  onCompareToggle?: (ws: Workspace, isChecked: boolean) => void
  isCompared?: boolean
}

export default function WorkspaceCard({
  workspace,
  score,
  reasons,
  onBookClick,
  onCompareToggle,
  isCompared = false
}: WorkspaceCardProps) {
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    let active = true
    const checkFavorite = async () => {
      try {
        const result = await isFavoriteAction(workspace.id)
        if (active) setIsFav(result)
      } catch (e) {}
    }
    checkFavorite()
    return () => { active = false }
  }, [workspace.id])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavLoading(true)
    try {
      const result = await toggleFavoriteAction(workspace.id)
      setIsFav(result)
    } catch (e) {
      console.error(e)
    } finally {
      setFavLoading(false)
    }
  }

  // Get color for AI Score
  const getScoreColor = (s: number) => {
    if (s >= 90) return "bg-green-500 text-white"
    if (s >= 75) return "bg-blue-500 text-white"
    if (s >= 50) return "bg-amber-500 text-white"
    return "bg-slate-500 text-white"
  }

  const [imgSrc, setImgSrc] = useState(
    workspace.images && workspace.images[0] 
      ? workspace.images[0] 
      : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
  )

  useEffect(() => {
    if (workspace.images && workspace.images[0]) {
      setImgSrc(workspace.images[0])
    }
  }, [workspace.images])

  const handleImgError = () => {
    // If the image fails to load, use a reliable fallback office photo
    setImgSrc("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80")
  }

  return (
    <Card className="glass-card overflow-hidden group flex flex-col h-full bg-card/50 border-border">
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
        <img
          src={imgSrc}
          alt={workspace.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImgError}
          loading="lazy"
        />
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-foreground hover:text-red-500 border border-border shadow-sm transition-transform active:scale-90 cursor-pointer"
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isFav ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* AI Recommendation Score Badge */}
        {score !== undefined && (
          <div className="absolute left-3 top-3 z-10 flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-white/20 animate-pulse">
            <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300 mr-0.5" />
            <span>Match {score}%</span>
          </div>
        )}

        {/* Workspace Rating Badge */}
        <div className="absolute left-3 bottom-3 z-10 flex items-center space-x-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm border border-white/10">
          <span>⭐ {workspace.rating}</span>
        </div>

        {/* Available seats */}
        <div className="absolute right-3 bottom-3 z-10 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white border border-blue-500/20">
          <span>{workspace.availableSeats} desks left</span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Name and address */}
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <Link href={`/workspace/${workspace.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-base leading-snug tracking-tight text-foreground truncate max-w-[220px]">
                {workspace.name}
              </h3>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground flex items-center truncate">
            <MapPin className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
            {workspace.address}
          </p>
        </div>

        {/* Core factors stats */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-2 rounded-lg border border-border/40 text-[11px]">
          <div className="flex items-center text-foreground font-medium">
            <Wifi className="h-3.5 w-3.5 text-blue-500 mr-1.5 shrink-0" />
            <span className="truncate">{workspace.wifiSpeed} Mbps WiFi</span>
          </div>
          <div className="flex items-center text-foreground font-medium">
            <VolumeX className="h-3.5 w-3.5 text-indigo-500 mr-1.5 shrink-0" />
            <span className="truncate">{workspace.noiseLevel} Noise</span>
          </div>
        </div>

        {/* Match explanation bullets */}
        {reasons && reasons.length > 0 && (
          <div className="space-y-1 border-t border-border/40 pt-2 shrink-0">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide flex items-center">
              <Info className="h-2.5 w-2.5 mr-1" />
              Why this matches:
            </p>
            <ul className="text-[10px] text-foreground space-y-0.5">
              {reasons.slice(0, 2).map((r, i) => (
                <li key={i} className="flex items-center truncate">
                  <span className="h-1 w-1 bg-primary rounded-full mr-1.5 shrink-0" />
                  <span className="truncate">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer actions */}
        <div className="border-t border-border/40 pt-3 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium leading-none">Starting from</span>
            <span className="text-base font-extrabold text-foreground mt-0.5">
              ₹{workspace.pricePerDay}
              <span className="text-[10px] text-muted-foreground font-semibold">/day</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Compare Checkbox */}
            {onCompareToggle && (
              <Button
                variant={isCompared ? "secondary" : "outline"}
                size="icon"
                onClick={() => onCompareToggle(workspace, !isCompared)}
                className={`h-8 w-8 rounded-md cursor-pointer ${isCompared ? "text-primary border-primary/20 bg-primary/5" : ""}`}
                title="Add to Compare"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Book visit button */}
            {onBookClick ? (
              <Button
                size="sm"
                onClick={() => onBookClick(workspace)}
                className="h-8 text-xs font-bold cursor-pointer"
              >
                <Calendar className="h-3 w-3 mr-1.5" />
                Book Visit
              </Button>
            ) : (
              <Link href={`/workspace/${workspace.id}`}>
                <Button size="sm" className="h-8 text-xs font-bold cursor-pointer">
                  View Details
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
