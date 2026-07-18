"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  User, Mail, ArrowLeft, Sliders, Calendar, Check, Save, 
  Trash2, XCircle, Clock, CheckCircle2, ShieldCheck, Heart 
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { getUserProfileAction, updateUserProfileAction } from "../../actions/profile"
import { getUserBookings, cancelBookingAction } from "../../actions/bookings"
import { User as UserType, Booking } from "../../types"
import { MOCK_AMENITIES } from "../../lib/seedData"

export default function UserProfilePage() {
  const router = useRouter()
  
  // States
  const [profile, setProfile] = useState<UserType | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Preferences editor state
  const [budget, setBudget] = useState(600)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [name, setName] = useState("")

  const loadData = async () => {
    try {
      // Load user profile preferences
      const prof = await getUserProfileAction()
      if (prof) {
        setProfile(prof)
        setName(prof.name || "")
        setBudget(prof.preferredBudget || 600)
        setSelectedAmenities(prof.preferredAmenities || [])
      }

      // Load bookings
      const bookData = await getUserBookings()
      setBookings(bookData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAmenityToggle = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(prev => prev.filter(a => a !== name))
    } else {
      setSelectedAmenities(prev => [...prev, name])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updateUserProfileAction({
        name,
        preferredBudget: budget,
        preferredAmenities: selectedAmenities
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this visit booking?")) return
    try {
      await cancelBookingAction(id)
      // Reload bookings
      const bookData = await getUserBookings()
      setBookings(bookData || [])
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading preferences and bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back to search */}
      <Link href="/dashboard" className="inline-flex items-center space-x-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
          <Sliders className="h-6 w-6 text-primary mr-2" />
          User Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Customize matching scores and review your workspace visit history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column - profile options (8 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Details & Budget Card */}
          <Card className="bg-card/50 border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Preferences Configurator</CardTitle>
              <CardDescription className="text-xs">Adjust parameters used in the AI Recommendation formula.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveSuccess && (
                <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-lg text-xs leading-relaxed">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Preferences saved successfully! AI score formulas updated.</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              {/* Preferred budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Preferred Daily Budget</label>
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
                <span className="text-[10px] text-muted-foreground block">
                  Budget match accounts for 20% of the overall AI recommendation index.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Preferred Amenities checklist */}
          <Card className="bg-card/50 border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Preferred Amenities</CardTitle>
              <CardDescription className="text-xs">Select amenities you require to highlight matching spaces.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCK_AMENITIES.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity.name)
                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.name)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? "border-primary/40 bg-primary/5 text-foreground font-semibold" 
                        : "border-border bg-background/30 text-muted-foreground hover:bg-background/60"
                    }`}
                  >
                    <span className="text-xs truncate max-w-[80%]">{amenity.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1.5" />}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
            </Button>
          </div>
        </form>

        {/* Right column - Booking History (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Account Info */}
          {profile && (
            <Card className="bg-card/65 border-border shadow-sm text-center p-6 flex flex-col items-center">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name || "User"}
                  className="h-16 w-16 rounded-full border-2 border-primary object-cover shadow-sm mb-4"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/60 text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl mb-4">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <h3 className="font-extrabold text-foreground leading-snug">{profile.name || "User"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
            </Card>
          )}

          {/* Visits bookings list */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center px-1">
              <Calendar className="h-4 w-4 text-primary mr-1.5" />
              Booking History
            </h3>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map(book => (
                  <Card key={book.id} className="bg-card/50 border-border shadow-sm p-4 relative overflow-hidden">
                    {/* Status Badge */}
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

                    <div className="space-y-2 max-w-[80%]">
                      <Link href={`/workspace/${book.workspaceId}`} className="hover:underline font-bold text-xs text-foreground truncate block">
                        {book.workspace?.name || "Workspace"}
                      </Link>
                      
                      <div className="space-y-0.5 text-[10px] text-muted-foreground">
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 shrink-0" />
                          {new Date(book.date).toLocaleDateString()} at {book.time}
                        </p>
                        <p className="flex items-center">
                          <User className="h-3 w-3 mr-1 shrink-0" />
                          Team Size: {book.teamSize} | Purpose: {book.purpose}
                        </p>
                      </div>
                    </div>

                    {book.status === "Pending" && (
                      <div className="border-t border-border/40 pt-2.5 mt-3 flex justify-end">
                        <button
                          onClick={() => handleCancelBooking(book.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel Visit</span>
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center border-dashed border border-border/60">
                <CardContent className="p-2 space-y-2">
                  <Calendar className="h-8 w-8 text-muted-foreground/35 mx-auto" />
                  <p className="text-xs text-muted-foreground">No bookings made yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
