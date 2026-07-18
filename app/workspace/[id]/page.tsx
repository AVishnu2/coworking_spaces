"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Wifi, VolumeX, MapPin, Heart, Calendar, ArrowLeft, 
  Clock, Users, Train, Coffee, Store, ShieldAlert, Sparkles,
  Utensils, DollarSign, PlusCircle, CheckCircle, Info, Car, Video, Star
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import BookingModal from "../../../components/workspace/BookingModal"
import { getWorkspaceDetails, toggleFavoriteAction, isFavoriteAction, submitReview } from "../../../actions/workspaces"
import { summarizeReviews, ReviewSummary } from "../../../lib/gemini"
import { Workspace, Review } from "../../../types"

export default function WorkspaceDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const workspaceId = id as string

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // AI Review Summary
  const [aiSummary, setAiSummary] = useState<ReviewSummary | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(true)

  // Write new review
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Image fallbacks state
  const [mainImg, setMainImg] = useState("")
  const [subImg1, setSubImg1] = useState("")
  const [subImg2, setSubImg2] = useState("")

  const fetchDetails = async () => {
    try {
      const data = await getWorkspaceDetails(workspaceId)
      if (!data) {
        router.push("/dashboard")
        return
      }
      setWorkspace(data)
      if (data.images) {
        setMainImg(data.images[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80")
        setSubImg1(data.images[1] || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80")
        setSubImg2(data.images[2] || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80")
      }

      // Fetch favorite status
      const fav = await isFavoriteAction(workspaceId)
      setIsFav(fav)

      // Fetch AI summary
      if (data.reviews && data.reviews.length > 0) {
        setAiSummaryLoading(true)
        const summary = await summarizeReviews(data.reviews)
        setAiSummary(summary)
      } else {
        setAiSummary({
          pros: ["Brand new space"],
          cons: ["No reviews written yet"],
          summary: "This workspace is fresh and has not received any reviews yet. Be the first to try it!"
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setAiSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (workspaceId) {
      fetchDetails()
    }
  }, [workspaceId])

  const handleFavoriteToggle = async () => {
    setFavLoading(true)
    try {
      const result = await toggleFavoriteAction(workspaceId)
      setIsFav(result)
    } catch (e) {
      console.error(e)
    } finally {
      setFavLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setReviewSubmitting(true)
    try {
      await submitReview(workspaceId, newRating, newComment)
      setNewComment("")
      setNewRating(5)
      // Reload workspace details
      await fetchDetails()
    } catch (e) {
      console.error(e)
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading workspace details...</p>
      </div>
    )
  }

  if (!workspace) return null

  // Generated Simulated Nearby Essentials list
  const mockEssentials = [
    { name: `${workspace.name.split(" ")[0]} Food Court`, type: "Restaurant", icon: Utensils, distance: "120m" },
    { name: `${workspace.address.split(",")[3]} Metro Link`, type: "Metro", icon: Train, distance: `${workspace.metroDistance} km` },
    { name: "State Bank of India ATM", type: "ATM", icon: DollarSign, distance: "80m" },
    { name: "Coffee Day Express", type: "Coffee Shop", icon: Coffee, distance: "250m" },
    { name: "Apollo Pharmacy", type: "Medical Shop", icon: Store, distance: "350m" },
    { name: "Public Paid Parking Lot", type: "Parking", icon: CheckCircle, distance: "180m" }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Search</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground tracking-tight">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            {workspace.address}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Favorite Toggle */}
          <Button
            variant={isFav ? "secondary" : "outline"}
            onClick={handleFavoriteToggle}
            disabled={favLoading}
            className={`cursor-pointer ${isFav ? "text-red-500 border-red-500/20 bg-red-50/40 dark:bg-red-950/20" : ""}`}
          >
            <Heart className={`h-4.5 w-4.5 mr-1.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
            <span>{isFav ? "Saved to Favorites" : "Add to Favorites"}</span>
          </Button>

          {/* Book visit button */}
          <Button
            onClick={() => setShowBookingModal(true)}
            className="shadow-lg font-bold cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Book a Visit
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[350px] shrink-0">
        <div className="md:col-span-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-border">
          <img 
            src={mainImg} 
            alt={workspace.name}
            className="h-full w-full object-cover" 
            onError={() => setMainImg("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80")}
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-border">
            <img 
              src={subImg1} 
              alt={workspace.name}
              className="h-full w-full object-cover" 
              onError={() => setSubImg1("https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80")}
            />
          </div>
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-border">
            <img 
              src={subImg2} 
              alt={workspace.name}
              className="h-full w-full object-cover" 
              onError={() => setSubImg2("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80")}
            />
          </div>
        </div>
      </div>

      {/* Page Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Specifications & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Workspace Description */}
          <Card className="bg-card/50 border-border shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold">About the Workspace</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <p className="text-sm text-foreground leading-relaxed">{workspace.description}</p>
            </CardContent>
          </Card>

          {/* Core Specs metrics card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-center space-y-1 bg-card/60">
              <Wifi className="h-5 w-5 text-blue-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Internet Speed</span>
              <span className="text-base font-extrabold text-foreground">{workspace.wifiSpeed} Mbps</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-center space-y-1 bg-card/60">
              <VolumeX className="h-5 w-5 text-indigo-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Noise Level</span>
              <span className="text-base font-extrabold text-foreground">{workspace.noiseLevel} Zone</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-center space-y-1 bg-card/60">
              <Train className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Metro distance</span>
              <span className="text-base font-extrabold text-foreground">{workspace.metroDistance} km</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-center space-y-1 bg-card/60">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Seats Available</span>
              <span className="text-base font-extrabold text-foreground">{workspace.availableSeats} Seats</span>
            </div>
          </div>

          {/* Amenities checklist */}
          <Card className="bg-card/50 border-border shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold">Workspace Amenities</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className={`flex items-center space-x-2 text-xs font-semibold ${workspace.parking ? "text-foreground" : "text-muted-foreground line-through"}`}>
                <Car className="h-4 w-4 shrink-0 text-primary" />
                <span>Dedicated Parking</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs font-semibold ${workspace.cafeteria ? "text-foreground" : "text-muted-foreground line-through"}`}>
                <Coffee className="h-4 w-4 shrink-0 text-primary" />
                <span>In-house Cafeteria</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs font-semibold ${workspace.meetingRooms ? "text-foreground" : "text-muted-foreground line-through"}`}>
                <Video className="h-4 w-4 shrink-0 text-primary" />
                <span>Meeting Rooms</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-foreground">
                <Wifi className="h-4 w-4 shrink-0 text-primary" />
                <span>High-Speed WiFi</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>24/7 Power Backup</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>AC Working Area</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Reviews Summary Section */}
          <Card className="border border-primary/20 bg-primary/5 shadow-md relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-500/10 blur-xl rounded-full" />
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold flex items-center space-x-1.5 text-primary">
                <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>Gemini AI Review Summarizer</span>
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Real-time analysis of user feedback</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {aiSummaryLoading ? (
                <div className="flex items-center space-x-3 py-4 text-xs font-semibold text-primary">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>AI is parsing reviews...</span>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  {/* Suitability summary */}
                  <div className="bg-card/75 border border-border p-3.5 rounded-lg text-xs leading-relaxed text-foreground shadow-sm">
                    <strong>Overall Summary:</strong> {aiSummary.summary}
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide block">Pros</span>
                      <ul className="text-xs space-y-1 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                        {aiSummary.pros.map((p, idx) => (
                          <li key={idx} className="flex items-center text-foreground font-medium">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide block">Cons</span>
                      <ul className="text-xs space-y-1 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                        {aiSummary.cons.map((c, idx) => (
                          <li key={idx} className="flex items-center text-foreground font-medium">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Unable to generate AI review summary at this moment.</p>
              )}
            </CardContent>
          </Card>

          {/* User Reviews list & write review */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">User Reviews ({workspace.reviews?.length || 0})</h3>
            
            {/* Reviews stream */}
            {workspace.reviews && workspace.reviews.length > 0 ? (
              <div className="space-y-3">
                {workspace.reviews.map(r => (
                  <Card key={r.id} className="bg-card/40 border-border/80 shadow-sm p-4">
                    <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                          {r.user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-bold text-xs text-foreground">{r.user?.name || "Anonymous User"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-extrabold text-yellow-500">⭐ {r.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{r.comment}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic pl-2">No reviews available yet.</p>
            )}

            {/* Write a review */}
            <Card className="bg-card/65 border-border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Write a Review</CardTitle>
                <CardDescription className="text-[10px]">Share your experience to help the community</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Rating:</span>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNewRating(val)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star className={`h-5 w-5 ${val <= newRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/40"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Explain how the WiFi, noise level, and washroom hygiene were..."
                      required
                      rows={3}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                      disabled={reviewSubmitting}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="font-bold cursor-pointer text-xs h-8"
                      disabled={reviewSubmitting || !newComment.trim()}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Sidebar & Map (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          
          {/* Pricing Panel */}
          <Card className="border border-border shadow-md bg-card/65 backdrop-blur-md">
            <CardHeader className="p-6 border-b border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pricing options</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-foreground">₹{workspace.pricePerDay}</span>
                <span className="text-sm font-semibold text-muted-foreground">/day</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 text-xs">
                <span className="font-semibold text-muted-foreground">Monthly Hot desk</span>
                <span className="font-extrabold text-foreground">₹{workspace.pricePerMonth}/month</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 text-xs">
                <span className="font-semibold text-muted-foreground">Open Hours</span>
                <span className="font-extrabold text-foreground flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  08:00 AM - 08:00 PM
                </span>
              </div>
              <div className="flex items-center justify-between pb-1 text-xs">
                <span className="font-semibold text-muted-foreground">Washroom Rating</span>
                <span className="font-extrabold text-foreground">⭐ {workspace.washroomRating} / 5</span>
              </div>

              <Button
                onClick={() => setShowBookingModal(true)}
                className="w-full font-bold shadow-lg mt-4 h-11 cursor-pointer"
              >
                Schedule Visit Booking
              </Button>
            </CardContent>
          </Card>

          {/* Simulated Nearby Essentials widget */}
          <Card className="border border-border shadow-sm bg-card/65 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Nearby Essentials</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Commute links & nearby resources</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {mockEssentials.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2.5 truncate max-w-[70%]">
                      <div className="h-7 w-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-foreground truncate leading-snug">{item.name}</h4>
                        <span className="text-[9px] text-muted-foreground">{item.type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-primary shrink-0">{item.distance}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        workspace={workspace}
      />
    </div>
  )
}
