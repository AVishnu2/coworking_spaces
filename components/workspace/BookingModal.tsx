"use client"

import React, { useState } from "react"
import { Calendar, Clock, Users, FileText, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Workspace } from "../../types"
import { createBookingAction } from "../../actions/bookings"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: Workspace | null
}

export default function BookingModal({ open, onOpenChange, workspace }: BookingModalProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("10:00 AM")
  const [teamSize, setTeamSize] = useState(1)
  const [purpose, setPurpose] = useState("Co-working")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!workspace) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    setLoading(true)
    try {
      await createBookingAction({
        workspaceId: workspace.id,
        date,
        time,
        teamSize,
        purpose
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Workspace Visit</DialogTitle>
          <DialogDescription>
            Schedule a visit to see **{workspace.name}** in person.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/60 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-foreground">Visit Booked Successfully!</h3>
              <p className="text-xs text-muted-foreground mt-1">We have saved your booking to your dashboard.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-1">
              <label htmlFor="booking-date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Select Date
              </label>
              <input
                id="booking-date"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={loading}
              />
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-1">
              <label htmlFor="booking-time" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Preferred Time
              </label>
              <select
                id="booking-time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>

            {/* Team Size */}
            <div className="space-y-1">
              <label htmlFor="booking-team-size" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Team Size
              </label>
              <input
                id="booking-team-size"
                type="number"
                required
                min={1}
                max={workspace.availableSeats || 50}
                value={teamSize}
                onChange={e => setTeamSize(parseInt(e.target.value) || 1)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={loading}
              />
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <label htmlFor="booking-purpose" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Purpose of Visit
              </label>
              <select
                id="booking-purpose"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                <option value="Co-working">Co-working (Hot desk)</option>
                <option value="Meeting">Team Meeting</option>
                <option value="Interview">Candidate Interview</option>
                <option value="Client Presentation">Client Presentation</option>
                <option value="Evaluation">Space Evaluation</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full sm:w-auto font-bold shadow-md cursor-pointer"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Visit"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
