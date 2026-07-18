"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowLeftRight, Check, X, Sparkles, Plus, Wifi } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { getWorkspaceDetails, searchWorkspaces } from "../../actions/workspaces"
import { Workspace } from "../../types"

function WorkspaceComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idsParam = searchParams.get("ids")

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkspaces = async () => {
    try {
      // Fetch list of all spaces for dropdown selections
      const { workspaces: allSpaces } = await searchWorkspaces()
      setAllWorkspaces(allSpaces)

      if (idsParam) {
        const ids = idsParam.split(",")
        const loaded: Workspace[] = []
        for (const id of ids) {
          const ws = await getWorkspaceDetails(id)
          if (ws) loaded.push(ws)
        }
        setWorkspaces(loaded)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [idsParam])

  const handleRemove = (id: string) => {
    const updated = workspaces.filter(w => w.id !== id)
    setWorkspaces(updated)
    const newIds = updated.map(w => w.id).join(",")
    if (newIds) {
      router.replace(`/compare?ids=${newIds}`)
    } else {
      router.replace("/compare")
    }
  }

  const handleAddSpace = async (id: string) => {
    if (workspaces.length >= 3) {
      alert("You can compare a maximum of 3 workspaces.")
      return
    }
    if (workspaces.some(w => w.id === id)) return

    setLoading(true)
    try {
      const ws = await getWorkspaceDetails(id)
      if (ws) {
        const updated = [...workspaces, ws]
        setWorkspaces(updated)
        router.replace(`/compare?ids=${updated.map(w => w.id).join(",")}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading && workspaces.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading comparison metrics...</p>
      </div>
    )
  }

  const selectCandidates = allWorkspaces.filter(
    w => !workspaces.some(selected => selected.id === w.id)
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Link */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center space-x-1 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
            <ArrowLeftRight className="h-6 w-6 text-primary mr-2" />
            Compare Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Side-by-side specifications analysis (maximum 3 spaces).
          </p>
        </div>

        {workspaces.length < 3 && selectCandidates.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Add space:</span>
            <select
              value=""
              onChange={e => {
                if (e.target.value) handleAddSpace(e.target.value)
              }}
              className="rounded-md border border-border bg-card/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="">-- Select workspace --</option>
              {selectCandidates.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name} ({ws.address.split(",")[3] || ws.address})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {workspaces.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/60">
          <CardContent className="space-y-4">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-extrabold text-base text-foreground">No workspaces selected</h3>
              <p className="text-xs text-muted-foreground mt-1">Go back to the search dashboard and add workspaces to compare.</p>
            </div>
            <Link href="/dashboard">
              <Button className="cursor-pointer text-xs font-bold">Explore Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-lg select-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wide w-1/4">Specs Metric</th>
                {workspaces.map(ws => (
                  <th key={ws.id} className="p-4 w-1/4 border-l border-border relative">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-start justify-between">
                        <Link href={`/workspace/${ws.id}`} className="hover:underline">
                          <span className="font-extrabold text-sm text-foreground leading-snug">{ws.name}</span>
                        </Link>
                        <button
                          onClick={() => handleRemove(ws.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                          title="Remove from compare"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate">{ws.address.split(",")[2] || ws.address}</span>
                    </div>
                  </th>
                ))}
                {/* Fill empty comparison columns */}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <th key={idx} className="p-4 w-1/4 border-l border-border text-center text-muted-foreground/30 italic">
                    Slot Available
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Daily pricing */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Daily Price</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-extrabold text-foreground text-sm">
                    ₹{ws.pricePerDay} / day
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Monthly pricing */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Monthly Price</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    ₹{ws.pricePerMonth} / month
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* WiFi Speed */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">WiFi Speed</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground flex items-center space-x-1">
                    <Wifi className="h-4 w-4 text-blue-500 mr-1 shrink-0" />
                    <span>{ws.wifiSpeed} Mbps</span>
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Noise Level */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Noise Level</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    {ws.noiseLevel} Noise Zone
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Washroom hygiene */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Washroom Rating</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    ⭐ {ws.washroomRating} / 5
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Commute traffic */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Traffic Score</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    {ws.trafficScore} / 100 <span className="text-[10px] text-muted-foreground">(lower is better)</span>
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Metro Station link */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Metro Distance</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    {ws.metroDistance} km to station
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Available Seats */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Available Seats</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-semibold text-foreground">
                    {ws.availableSeats} hot desks left
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Dedicated Parking */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Parking</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border">
                    {ws.parking ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                        <Check className="h-4 w-4 mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 font-semibold">
                        <X className="h-4 w-4 mr-1" /> No
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* In-house Cafeteria */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Cafeteria</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border">
                    {ws.cafeteria ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                        <Check className="h-4 w-4 mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 font-semibold">
                        <X className="h-4 w-4 mr-1" /> No
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Glass Meeting Rooms */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Meeting Rooms</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border">
                    {ws.meetingRooms ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                        <Check className="h-4 w-4 mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 font-semibold">
                        <X className="h-4 w-4 mr-1" /> No
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b border-border hover:bg-background/40 transition-colors">
                <td className="p-4 font-bold text-foreground">Rating Overall</td>
                {workspaces.map(ws => (
                  <td key={ws.id} className="p-4 border-l border-border font-bold text-foreground">
                    ⭐ {ws.rating} / 5
                  </td>
                ))}
                {Array.from({ length: 3 - workspaces.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-border" />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function WorkspaceComparePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading comparison metrics...</p>
      </div>
    }>
      <WorkspaceComparePageContent />
    </Suspense>
  )
}
