"use client"

import React, { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, SlidersHorizontal, Map as MapIcon, Wifi, VolumeX, 
  Car, Coffee, Video, CheckCircle2, RefreshCw, Sparkles, 
  MapPin, Clock, Star, HelpCircle, ArrowLeftRight 
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import WorkspaceCard from "../../components/workspace/WorkspaceCard"
import BookingModal from "../../components/workspace/BookingModal"
import { searchWorkspaces } from "../../actions/workspaces"
import { Workspace, RecommendationResult } from "../../types"
import { mockAuth } from "../../lib/supabase"

export default function Dashboard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Session
  const [userName, setUserName] = useState("User")

  // Workspace lists
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [favorites, setFavorites] = useState<Workspace[]>([])

  // Search Filters State
  const [city, setCity] = useState("Hyderabad")
  const [searchQuery, setSearchQuery] = useState("")
  const [budget, setBudget] = useState(800)
  const [teamSize, setTeamSize] = useState(1)
  
  // Feature checkboxes
  const [wifiRequired, setWifiRequired] = useState(false)
  const [parking, setParking] = useState(false)
  const [cafeteria, setCafeteria] = useState(false)
  const [meetingRooms, setMeetingRooms] = useState(false)
  const [twentyFourSeven, setTwentyFourSeven] = useState(false)
  const [silentWorkspace, setSilentWorkspace] = useState(false)
  const [metroNearby, setMetroNearby] = useState(false)

  // Layout UI states
  const [activeTab, setActiveTab] = useState<"ai" | "popular" | "nearby" | "favorites">("ai")
  const [selectedMapSpace, setSelectedMapSpace] = useState<Workspace | null>(null)
  const [comparedSpaces, setComparedSpaces] = useState<Workspace[]>([])
  const [bookingWorkspace, setBookingWorkspace] = useState<Workspace | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch workspaces based on filters
  const fetchMatches = () => {
    startTransition(async () => {
      try {
        const filters = {
          city,
          search: searchQuery,
          budget,
          teamSize,
          parking,
          cafeteria,
          meetingRooms,
          twentyFourSeven,
          silentWorkspace,
          metroNearby,
          wifiSpeed: wifiRequired ? 150 : 0
        }
        const { workspaces, recommendations } = await searchWorkspaces(filters)
        setWorkspaces(workspaces)
        setRecommendations(recommendations || [])

        // If map selection is lost, default to first space
        if (workspaces.length > 0) {
          setSelectedMapSpace(workspaces[0])
        } else {
          setSelectedMapSpace(null)
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  // Initial load & trigger search
  useEffect(() => {
    const session = mockAuth.getSession()
    if (session) {
      setUserName(session.name)
    }

    // Load favorites from local mock storage
    const loadFavs = async () => {
      try {
        const { workspaces } = await searchWorkspaces()
        // Mock favorites sync: check favorites inside localStorage mock
        const mockData = localStorage.getItem("coworkiq_session")
        if (mockData) {
          const user = JSON.parse(mockData)
          // Get favorites from API
          const response = await fetch("/api/auth/session") // we can fetch it or just get from dbservice client-side mock
        }
      } catch (e) {}
    }
    loadFavs()
    fetchMatches()
  }, [city])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMatches()
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setBudget(800)
    setTeamSize(1)
    setWifiRequired(false)
    setParking(false)
    setCafeteria(false)
    setMeetingRooms(false)
    setTwentyFourSeven(false)
    setSilentWorkspace(false)
    setMetroNearby(false)
    // Run search with clean params
    setTimeout(fetchMatches, 50)
  }

  // Handle Workspace Comparison triggers
  const handleCompareToggle = (ws: Workspace, isChecked: boolean) => {
    if (isChecked) {
      if (comparedSpaces.length >= 3) {
        alert("You can compare up to 3 workspaces at once.")
        return
      }
      setComparedSpaces(prev => [...prev, ws])
    } else {
      setComparedSpaces(prev => prev.filter(w => w.id !== ws.id))
    }
  }

  const handleBookClick = (ws: Workspace) => {
    setBookingWorkspace(ws)
    setShowBookingModal(true)
  }

  // Get displayed spaces based on selected Tab
  const getDisplayedSpaces = () => {
    if (activeTab === "ai") {
      return recommendations.map(r => r.workspace)
    }
    if (activeTab === "popular") {
      return [...workspaces].sort((a, b) => b.rating - a.rating)
    }
    if (activeTab === "nearby") {
      return [...workspaces].sort((a, b) => a.metroDistance - b.metroDistance)
    }
    if (activeTab === "favorites") {
      // Just filter current workspaces by a simulated list (e.g. index divisible by 5 for demo)
      return workspaces.filter((_, idx) => idx % 4 === 0)
    }
    return workspaces
  }

  const displayedSpaces = getDisplayedSpaces()

  // Simulated coordinate bounds for current city
  const getMapCoordinatesRange = () => {
    // Collect coordinates from loaded workspaces
    if (workspaces.length === 0) return { minLat: 12.9, maxLat: 13.0, minLon: 77.5, maxLon: 77.7 }
    const lats = workspaces.map(w => w.latitude)
    const lons = workspaces.map(w => w.longitude)
    return {
      minLat: Math.min(...lats) - 0.005,
      maxLat: Math.max(...lats) + 0.005,
      minLon: Math.min(...lons) - 0.005,
      maxLon: Math.max(...lons) + 0.005
    }
  }

  const coordsRange = getMapCoordinatesRange()
  const latDiff = coordsRange.maxLat - coordsRange.minLat || 0.01
  const lonDiff = coordsRange.maxLon - coordsRange.minLon || 0.01

  // Convert coords to percentage for drawing simulated map markers
  const getMarkerPositions = (lat: number, lon: number) => {
    const x = ((lon - coordsRange.minLon) / lonDiff) * 100
    const y = 100 - ((lat - coordsRange.minLat) / latDiff) * 100 // Invert Y for screen space
    return { 
      left: `${Math.min(95, Math.max(5, x))}%`, 
      top: `${Math.min(95, Math.max(5, y))}%` 
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Welcome back, <span className="text-primary">{userName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Let&apos;s find your next high-performance workspace.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick City Selector */}
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Target City:</span>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="rounded-md border border-border bg-card/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi/NCR">Delhi/NCR</option>
          </select>
        </div>
      </div>

      {/* Main Filter Bar */}
      <Card className="border border-border bg-card/60 backdrop-blur-md shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by workspace name, address, keywords..."
                className="w-full rounded-md border border-border bg-background px-9 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <Button
                type="button"
                variant="glass"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1.5 cursor-pointer text-xs h-9"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters {showFilters ? "(Hide)" : "(Show)"}</span>
              </Button>

              <Button
                type="submit"
                className="font-bold shadow-md cursor-pointer text-xs h-9 px-6"
                disabled={isPending}
              >
                {isPending ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </form>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border/40 mt-4 animate-in fade-in slide-in-from-top-3">
              {/* Daily Budget Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Daily Budget</span>
                  <span className="text-xs font-extrabold text-primary">₹{budget}/day</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={50}
                  value={budget}
                  onChange={e => setBudget(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Team Size */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">Team Size</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={teamSize}
                  onChange={e => setTeamSize(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              {/* Checkbox group 1 */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={wifiRequired}
                    onChange={e => setWifiRequired(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>150+ Mbps WiFi required</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={silentWorkspace}
                    onChange={e => setSilentWorkspace(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Quiet Silent Workspace</span>
                </label>
              </div>

              {/* Checkbox group 2 */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={parking}
                    onChange={e => setParking(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Parking required</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={metroNearby}
                    onChange={e => setMetroNearby(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Metro proximity (&lt;1km)</span>
                </label>
              </div>

              {/* Reset filter button */}
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  Reset all filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Listings + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Listings Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-2">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center space-x-1.5 pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "ai"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Recommended Match</span>
            </button>

            <button
              onClick={() => setActiveTab("popular")}
              className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "popular"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Popular
            </button>

            <button
              onClick={() => setActiveTab("nearby")}
              className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "nearby"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Metro Close
            </button>

            <button
              onClick={() => setActiveTab("favorites")}
              className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "favorites"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Favorites
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Showing {displayedSpaces.length} coworking spaces found</span>
            {activeTab === "ai" && (
              <span className="flex items-center text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                Sorted by AI recommendation coefficient
              </span>
            )}
          </div>

          {/* Grid listing */}
          {displayedSpaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedSpaces.map(ws => {
                // Find AI score and reasons for this space
                const rec = recommendations.find(r => r.workspace.id === ws.id)
                const isCompared = comparedSpaces.some(w => w.id === ws.id)
                return (
                  <div key={ws.id} onClick={() => setSelectedMapSpace(ws)}>
                    <WorkspaceCard
                      workspace={ws}
                      score={activeTab === "ai" ? rec?.score : undefined}
                      reasons={activeTab === "ai" ? rec?.reasons : undefined}
                      onBookClick={handleBookClick}
                      onCompareToggle={handleCompareToggle}
                      isCompared={isCompared}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-border/60">
              <CardContent className="space-y-4">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-extrabold text-base text-foreground">No matches found</h3>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting your search parameters or reducing budget filters.</p>
                </div>
                <Button onClick={handleResetFilters} variant="outline" className="cursor-pointer text-xs">
                  Reset Search Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <Card className="overflow-hidden border border-border shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                  <MapIcon className="h-4 w-4 text-primary" />
                  <span>Interactive Workspace Map</span>
                </CardTitle>
                <CardDescription className="text-[10px] mt-0.5">Visual representation of workspace coordinates</CardDescription>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Interactive Pins
              </span>
            </CardHeader>
            <CardContent className="p-0 relative">
              {/* Simulated Map Canvas */}
              <div className="h-[320px] sm:h-[380px] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-b border-border/40 select-none">
                {/* Background grid texture representing map streets */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:20px_20px] opacity-60" />
                {/* Simulated metro lines and major grids */}
                <div className="absolute top-[25%] left-0 w-full h-[6px] bg-red-400/20 dark:bg-red-950/20 -rotate-12 transform origin-top-left" />
                <div className="absolute top-0 left-[35%] w-[8px] h-full bg-blue-400/20 dark:bg-blue-950/20 rotate-45 transform origin-top-left" />

                {/* Markers */}
                {displayedSpaces.map(ws => {
                  const isSelected = selectedMapSpace?.id === ws.id
                  const { left, top } = getMarkerPositions(ws.latitude, ws.longitude)
                  return (
                    <button
                      key={ws.id}
                      onClick={() => setSelectedMapSpace(ws)}
                      className="absolute z-10 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 focus:outline-none cursor-pointer"
                      style={{ left, top }}
                      title={ws.name}
                    >
                      <div className={`relative flex items-center justify-center rounded-full h-8 w-8 shadow-lg border transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-white scale-110 z-20" 
                          : "bg-card text-foreground border-border hover:bg-primary hover:text-white"
                      }`}>
                        {/* Custom Marker Pin */}
                        <MapPin className="h-4.5 w-4.5" />
                        
                        {/* Custom pulsing border on selected marker */}
                        {isSelected && (
                          <span className="absolute -inset-1.5 rounded-full border border-primary/40 animate-ping opacity-60" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Map Info Card (Active selected pin details) */}
              {selectedMapSpace && (
                <div className="p-4 bg-card/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/workspace/${selectedMapSpace.id}`} className="hover:underline">
                        <h4 className="font-extrabold text-sm text-foreground truncate max-w-[240px]">{selectedMapSpace.name}</h4>
                      </Link>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">{selectedMapSpace.address}</p>
                    </div>
                    <span className="text-xs font-extrabold text-primary">₹{selectedMapSpace.pricePerDay}/day</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                    <div className="flex flex-col bg-background/50 p-1.5 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground leading-none">WiFi</span>
                      <span className="font-bold text-foreground mt-0.5">{selectedMapSpace.wifiSpeed} Mbps</span>
                    </div>
                    <div className="flex flex-col bg-background/50 p-1.5 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground leading-none">Noise Level</span>
                      <span className="font-bold text-foreground mt-0.5">{selectedMapSpace.noiseLevel}</span>
                    </div>
                    <div className="flex flex-col bg-background/50 p-1.5 rounded border border-border/40">
                      <span className="text-[9px] text-muted-foreground leading-none">Metro Link</span>
                      <span className="font-bold text-foreground mt-0.5">{selectedMapSpace.metroDistance} km</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Link href={`/workspace/${selectedMapSpace.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs font-semibold h-8 cursor-pointer">
                        View Full Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={() => handleBookClick(selectedMapSpace)}
                      className="flex-1 text-xs font-semibold h-8 cursor-pointer"
                    >
                      Book Visit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Compare Tray (bottom drawer) */}
      {comparedSpaces.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 bg-card/90 border border-border glass-panel rounded-xl shadow-2xl p-4 flex items-center space-x-6 animate-in slide-in-from-left-6 duration-300">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-lg">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">Compare Workspaces</h4>
              <p className="text-[10px] text-muted-foreground font-semibold">{comparedSpaces.length} of 3 spaces selected</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href={`/compare?ids=${comparedSpaces.map(w => w.id).join(",")}`}>
              <Button size="sm" className="text-xs font-bold cursor-pointer h-8 px-4">
                Compare Now
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setComparedSpaces([])}
              className="text-[10px] hover:bg-destructive/10 hover:text-destructive h-8 px-3 cursor-pointer"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        workspace={bookingWorkspace}
      />
    </div>
  )
}
