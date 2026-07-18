"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ShieldAlert, LayoutDashboard, Plus, Trash2, Edit, Calendar, 
  MessageSquare, Check, X, ShieldCheck, MapPin, RefreshCw,
  Sliders, Info, HelpCircle
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { 
  addWorkspaceAction, updateWorkspaceAction, deleteWorkspaceAction,
  getAllBookingsAction, updateBookingStatusAction, deleteReviewAction 
} from "../../actions/admin"
import { searchWorkspaces } from "../../actions/workspaces"
import { Workspace, Booking, Review } from "../../types"
import { mockAuth } from "../../lib/supabase"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Subsections lists
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<"workspaces" | "bookings" | "reviews">("workspaces")

  // Form states for adding/editing workspace
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAddr, setFormAddr] = useState("")
  const [formPriceDay, setFormPriceDay] = useState(500)
  const [formPriceMonth, setFormPriceMonth] = useState(8000)
  const [formWifi, setFormWifi] = useState(150)
  const [formSeats, setFormSeats] = useState(25)
  const [formNoise, setFormNoise] = useState("Low")
  const [formWashroom, setFormWashroom] = useState(4.5)
  const [formTraffic, setFormTraffic] = useState(30)
  const [formMetro, setFormMetro] = useState(0.5)
  const [formLat, setFormLat] = useState(17.44)
  const [formLon, setFormLon] = useState(78.37)
  const [formParking, setFormParking] = useState(true)
  const [formCafeteria, setFormCafeteria] = useState(true)
  const [formMeeting, setFormMeeting] = useState(true)

  const [formSuccess, setFormSuccess] = useState(false)

  const loadData = async () => {
    try {
      const { workspaces: wsData } = await searchWorkspaces()
      setWorkspaces(wsData || [])

      const bookData = await getAllBookingsAction()
      setBookings(bookData || [])

      // Flatten reviews
      const allReviews: Review[] = []
      wsData.forEach(ws => {
        if (ws.reviews) {
          ws.reviews.forEach(r => {
            allReviews.push({ ...r, workspaceId: ws.id }) // inject workspace details or ID
          })
        }
      })
      setReviews(allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const session = mockAuth.getSession()
    if (!session || session.role !== "admin") {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)
    loadData().finally(() => setLoading(false))
  }, [router])

  const handleCreateOrUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSuccess(false)

    const workspaceData = {
      name: formName,
      description: formDesc,
      address: formAddr,
      pricePerDay: formPriceDay,
      pricePerMonth: formPriceMonth,
      wifiSpeed: formWifi,
      parking: formParking,
      cafeteria: formCafeteria,
      meetingRooms: formMeeting,
      chargingPorts: true,
      noiseLevel: formNoise,
      washroomRating: formWashroom,
      trafficScore: formTraffic,
      metroDistance: formMetro,
      availableSeats: formSeats,
      latitude: formLat,
      longitude: formLon,
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80"
      ]
    }

    try {
      if (editingId) {
        await updateWorkspaceAction(editingId, workspaceData)
      } else {
        await addWorkspaceAction(workspaceData)
      }
      setFormSuccess(true)
      handleResetForm()
      await loadData()
      setTimeout(() => setFormSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditWorkspaceClick = (ws: Workspace) => {
    setEditingId(ws.id)
    setFormName(ws.name)
    setFormDesc(ws.description)
    setFormAddr(ws.address)
    setFormPriceDay(ws.pricePerDay)
    setFormPriceMonth(ws.pricePerMonth)
    setFormWifi(ws.wifiSpeed)
    setFormSeats(ws.availableSeats)
    setFormNoise(ws.noiseLevel)
    setFormWashroom(ws.washroomRating)
    setFormTraffic(ws.trafficScore)
    setFormMetro(ws.metroDistance)
    setFormLat(ws.latitude)
    setFormLon(ws.longitude)
    setFormParking(ws.parking)
    setFormCafeteria(ws.cafeteria)
    setFormMeeting(ws.meetingRooms)
  }

  const handleResetForm = () => {
    setEditingId(null)
    setFormName("")
    setFormDesc("")
    setFormAddr("")
    setFormPriceDay(500)
    setFormPriceMonth(8000)
    setFormWifi(150)
    setFormSeats(25)
    setFormNoise("Low")
    setFormWashroom(4.5)
    setFormTraffic(30)
    setFormMetro(0.5)
    setFormLat(17.44)
    setFormLon(78.37)
    setFormParking(true)
    setFormCafeteria(true)
    setFormMeeting(true)
  }

  const handleDeleteWorkspaceClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workspace and all associated reviews/bookings?")) return
    try {
      await deleteWorkspaceAction(id)
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBookingApprove = async (id: string) => {
    try {
      await updateBookingStatusAction(id, "Confirmed")
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBookingReject = async (id: string) => {
    try {
      await updateBookingStatusAction(id, "Cancelled")
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteReviewClick = async (id: string) => {
    if (!confirm("Are you sure you want to remove this review?")) return
    try {
      await deleteReviewAction(id)
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading Admin Dashboard...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border border-border bg-card/65 text-center shadow-xl p-8 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-foreground mt-4">Access Restricted</h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
            You must log in using an administrative account to access this console.
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 border border-border p-3.5 rounded-lg text-left mt-6 text-xs text-foreground font-mono space-y-1">
            <p><strong>Demo Email:</strong> admin@coworkingspaces.com</p>
            <p><strong>Password:</strong> (any value)</p>
          </div>
          <Link href="/login" className="inline-block mt-6 w-full">
            <Button className="w-full font-bold cursor-pointer">Go to Login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
            <ShieldCheck className="h-7 w-7 text-primary mr-2" />
            Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage coworking locations, moderate reviews, and confirm visit bookings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("workspaces")}
          className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "workspaces"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Workspaces CRUD
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Bookings Confirmation ({bookings.filter(b => b.status === "Pending").length})
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-2.5 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Review Moderation ({reviews.length})
        </button>
      </div>

      {/* WORKSPACES CRUD TAB */}
      {activeTab === "workspaces" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Workspace form (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="bg-card/50 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  {editingId ? "Update Workspace" : "Add New Workspace"}
                </CardTitle>
                <CardDescription className="text-xs">
                  Fill in parameters for the workspace record.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrUpdateWorkspace} className="space-y-4">
                  {formSuccess && (
                    <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-lg text-xs leading-relaxed">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Workspace successfully saved!</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Workspace Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Innov8 Spark"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Address</label>
                    <input
                      type="text"
                      required
                      value={formAddr}
                      onChange={e => setFormAddr(e.target.value)}
                      placeholder="Plot No. 44, Gachibowli, Hyderabad"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Description</label>
                    <textarea
                      required
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      rows={3}
                      placeholder="Welcome to this workspace..."
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Pricing grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Price Per Day (₹)</label>
                      <input
                        type="number"
                        required
                        value={formPriceDay}
                        onChange={e => setFormPriceDay(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Price Per Month (₹)</label>
                      <input
                        type="number"
                        required
                        value={formPriceMonth}
                        onChange={e => setFormPriceMonth(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Tech specs grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">WiFi (Mbps)</label>
                      <input
                        type="number"
                        required
                        value={formWifi}
                        onChange={e => setFormWifi(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Seats Left</label>
                      <input
                        type="number"
                        required
                        value={formSeats}
                        onChange={e => setFormSeats(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Noise Zone</label>
                      <select
                        value={formNoise}
                        onChange={e => setFormNoise(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Ratings Specs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Washroom Rating</label>
                      <input
                        type="number"
                        step={0.1}
                        min={1}
                        max={5}
                        required
                        value={formWashroom}
                        onChange={e => setFormWashroom(parseFloat(e.target.value) || 4.5)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Traffic (0-100)</label>
                      <input
                        type="number"
                        required
                        value={formTraffic}
                        onChange={e => setFormTraffic(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Metro (km)</label>
                      <input
                        type="number"
                        step={0.1}
                        required
                        value={formMetro}
                        onChange={e => setFormMetro(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Amenities switches */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        checked={formParking}
                        onChange={e => setFormParking(e.target.checked)}
                        className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Parking</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        checked={formCafeteria}
                        onChange={e => setFormCafeteria(e.target.checked)}
                        className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Cafeteria</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        checked={formMeeting}
                        onChange={e => setFormMeeting(e.target.checked)}
                        className="rounded border-border bg-background text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Meeting Rooms</span>
                    </label>
                  </div>

                  {/* Submit actions */}
                  <div className="flex items-center space-x-2 pt-4">
                    <Button type="submit" className="flex-1 font-bold shadow-md cursor-pointer text-xs">
                      {editingId ? "Update Record" : "Create Record"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={handleResetForm} className="text-xs cursor-pointer">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Workspaces list (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center px-1">
              Active Locations ({workspaces.length})
            </h3>
            
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {workspaces.map(ws => (
                <Card key={ws.id} className="bg-card/50 border-border shadow-sm p-4 flex items-center justify-between">
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs text-foreground truncate">{ws.name}</span>
                      <span className="text-[10px] font-bold text-primary">₹{ws.pricePerDay}/day</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{ws.address}</p>
                    <div className="flex items-center space-x-2 text-[9px] text-muted-foreground">
                      <span>📡 {ws.wifiSpeed} Mbps WiFi</span>
                      <span>•</span>
                      <span>🤫 {ws.noiseLevel} Noise</span>
                      <span>•</span>
                      <span>⭐ {ws.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleEditWorkspaceClick(ws)}
                      className="h-8 w-8 rounded-md cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={() => handleDeleteWorkspaceClick(ws.id)}
                      className="h-8 w-8 rounded-md cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS MANAGEMENT TAB */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-foreground px-1">Visitor Scheduler Console</h3>
          
          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map(book => (
                <Card key={book.id} className="bg-card/50 border-border p-4 relative flex flex-col justify-between h-44 shadow-sm">
                  {/* Status Indicator */}
                  <div className="absolute right-3 top-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${
                      book.status === "Confirmed"
                        ? "bg-green-500/10 border-green-500/20 text-green-600"
                        : book.status === "Cancelled"
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-w-[80%]">
                    <h4 className="font-extrabold text-xs text-foreground truncate">{book.workspace?.name}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center leading-none">
                      👤 {book.user?.name || "Client"} ({book.user?.email})
                    </p>
                    <div className="text-[10px] text-muted-foreground pt-1 space-y-0.5 leading-none">
                      <p>🗓️ {new Date(book.date).toLocaleDateString()} at {book.time}</p>
                      <p>👥 Size: {book.teamSize} | Purpose: {book.purpose}</p>
                    </div>
                  </div>

                  {book.status === "Pending" ? (
                    <div className="flex items-center gap-2 border-t border-border/40 pt-3 mt-4 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleBookingApprove(book.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-[10px] cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingReject(book.id)}
                        className="flex-1 hover:bg-red-500 hover:text-white font-bold h-8 text-[10px] border-border hover:border-red-500 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground font-semibold text-right pt-3 border-t border-border/40 mt-4 leading-none">
                      Logged {new Date(book.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border border-border/60 max-w-md mx-auto">
              <CardContent className="space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground/35 mx-auto" />
                <p className="text-xs text-muted-foreground">No visit bookings logged yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* REVIEWS MODERATION TAB */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-foreground px-1">Moderator Review Listing</h3>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rev => {
                const ws = workspaces.find(w => w.id === rev.workspaceId)
                return (
                  <Card key={rev.id} className="bg-card/50 border-border p-4 shadow-sm flex flex-col justify-between h-40">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[10px] text-foreground truncate max-w-[200px]">{ws?.name || "Workspace"}</span>
                          <span className="text-[9px] text-muted-foreground">User: {rev.userId.replace("user-mock-", "")}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs font-bold text-yellow-500">⭐ {rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed line-clamp-3">{rev.comment}</p>
                    </div>

                    <div className="flex justify-end pt-2 mt-2 border-t border-border/30 shrink-0">
                      <button
                        onClick={() => handleDeleteReviewClick(rev.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border border-border/60 max-w-md mx-auto">
              <CardContent className="space-y-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/35 mx-auto" />
                <p className="text-xs text-muted-foreground">No user reviews written yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
