import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { 
  Workspace, Review, Booking, Favorite, User, Location, 
  RecommendationResult 
} from "../types"
import { generateWorkspaces, generateReviews, MOCK_AMENITIES, MOCK_LOCATIONS } from "./seedData"
import { computeRecommendationScore } from "./recommendation"

// Instantiating Prisma Client
// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Mock Database File Path
const MOCK_DB_PATH = path.join(process.cwd(), "lib", "mock_db.json")

interface MockSchema {
  users: User[]
  workspaces: Workspace[]
  reviews: Review[]
  bookings: Booking[]
  favorites: Favorite[]
  locations: Location[]
}

// Check if database URL is valid and configured
const isDbConnected = (): boolean => {
  const url = process.env.DATABASE_URL
  if (!url) return false
  if (url.includes("localhost:5432/coworkiq") || url.includes("your-supabase-project")) {
    // If it is default or empty, return false to use mock by default unless user sets it up
    return false
  }
  return true
}

// File-based Mock DB Controller
class MockDbController {
  private data: MockSchema | null = null

  private init() {
    if (this.data) return

    // If file exists, read it
    if (fs.existsSync(MOCK_DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(MOCK_DB_PATH, "utf-8")
        this.data = JSON.parse(fileContent)
        return
      } catch (e) {
        console.error("Error reading mock DB file, reinitializing...", e)
      }
    }

    // Generate fresh mock data
    const workspaces = generateWorkspaces()
    const reviews = generateReviews(workspaces)
    const locations = MOCK_LOCATIONS.map((loc, idx) => ({
      id: `loc-${idx + 1}`,
      ...loc
    }))

    // Generate initial mock users
    const users: User[] = [
      {
        id: "user-mock-demouser",
        email: "demo@coworkiq.com",
        name: "Demo User",
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        preferredBudget: 500,
        preferredAmenities: ["High-Speed WiFi", "Air Conditioning", "Silent Zones"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "user-mock-admin",
        email: "admin@coworkingspaces.com",
        name: "CoWorking Spaces Admin",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        preferredBudget: 1000,
        preferredAmenities: ["Meeting Rooms", "Dedicated Parking"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    this.data = {
      users,
      workspaces,
      reviews,
      bookings: [],
      favorites: [],
      locations
    }

    this.save()
  }

  private save() {
    if (!this.data) return
    try {
      // Ensure directory exists
      const dir = path.dirname(MOCK_DB_PATH)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(this.data, null, 2), "utf-8")
    } catch (e) {
      console.error("Error saving mock DB file:", e)
    }
  }

  public getData(): MockSchema {
    this.init()
    return this.data!
  }

  public saveWorkspace(ws: Workspace) {
    this.init()
    const idx = this.data!.workspaces.findIndex(w => w.id === ws.id)
    if (idx >= 0) {
      this.data!.workspaces[idx] = { ...this.data!.workspaces[idx], ...ws, updatedAt: new Date().toISOString() }
    } else {
      this.data!.workspaces.push(ws)
    }
    this.save()
  }

  public deleteWorkspace(id: string) {
    this.init()
    this.data!.workspaces = this.data!.workspaces.filter(w => w.id !== id)
    this.data!.reviews = this.data!.reviews.filter(r => r.workspaceId !== id)
    this.data!.bookings = this.data!.bookings.filter(b => b.workspaceId !== id)
    this.data!.favorites = this.data!.favorites.filter(f => f.workspaceId !== id)
    this.save()
  }

  public saveBooking(booking: Booking) {
    this.init()
    const idx = this.data!.bookings.findIndex(b => b.id === booking.id)
    if (idx >= 0) {
      this.data!.bookings[idx] = { ...this.data!.bookings[idx], ...booking }
    } else {
      this.data!.bookings.push(booking)
    }
    this.save()
  }

  public deleteBooking(id: string) {
    this.init()
    this.data!.bookings = this.data!.bookings.filter(b => b.id !== id)
    this.save()
  }

  public saveReview(review: Review) {
    this.init()
    this.data!.reviews.push(review)
    
    // Update workspace rating
    const wsReviews = this.data!.reviews.filter(r => r.workspaceId === review.workspaceId)
    const avgRating = wsReviews.reduce((sum, r) => sum + r.rating, 0) / wsReviews.length
    const wsIdx = this.data!.workspaces.findIndex(w => w.id === review.workspaceId)
    if (wsIdx >= 0) {
      this.data!.workspaces[wsIdx].rating = Number(avgRating.toFixed(1))
    }
    
    this.save()
  }

  public deleteReview(id: string) {
    this.init()
    const review = this.data!.reviews.find(r => r.id === id)
    if (!review) return
    this.data!.reviews = this.data!.reviews.filter(r => r.id !== id)
    
    // Update workspace rating
    const wsReviews = this.data!.reviews.filter(r => r.workspaceId === review.workspaceId)
    const avgRating = wsReviews.length > 0 
      ? wsReviews.reduce((sum, r) => sum + r.rating, 0) / wsReviews.length 
      : 0
    const wsIdx = this.data!.workspaces.findIndex(w => w.id === review.workspaceId)
    if (wsIdx >= 0) {
      this.data!.workspaces[wsIdx].rating = Number(avgRating.toFixed(1))
    }

    this.save()
  }

  public saveFavorite(fav: Favorite) {
    this.init()
    const exists = this.data!.favorites.some(f => f.userId === fav.userId && f.workspaceId === fav.workspaceId)
    if (!exists) {
      this.data!.favorites.push(fav)
    } else {
      this.data!.favorites = this.data!.favorites.filter(
        f => !(f.userId === fav.userId && f.workspaceId === fav.workspaceId)
      )
    }
    this.save()
  }

  public saveUser(user: User) {
    this.init()
    const idx = this.data!.users.findIndex(u => u.id === user.id)
    if (idx >= 0) {
      this.data!.users[idx] = { ...this.data!.users[idx], ...user, updatedAt: new Date().toISOString() }
    } else {
      this.data!.users.push(user)
    }
    this.save()
  }
}

const mockDb = new MockDbController()

// EXPOSED DB SERVICE APIs
export const dbService = {
  // WORKSPACES
  async getWorkspaces(filters?: {
    city?: string
    search?: string
    budget?: number
    teamSize?: number
    wifiSpeed?: number
    parking?: boolean
    cafeteria?: boolean
    meetingRooms?: boolean
    chargingPorts?: boolean
    noiseLevel?: string
    metroNearby?: boolean
    wheelchair?: boolean
    petFriendly?: boolean
    ac?: boolean
    twentyFourSeven?: boolean
    silentWorkspace?: boolean
  }): Promise<{ workspaces: Workspace[]; recommendations?: RecommendationResult[] }> {
    
    // If DB is connected, try actual DB query
    if (isDbConnected()) {
      try {
        // Build Prisma filters dynamically
        const prismaFilters: any = {}
        if (filters?.city) {
          prismaFilters.address = { contains: filters.city, mode: "insensitive" }
        }
        if (filters?.search) {
          prismaFilters.OR = [
            { name: { contains: filters.search, mode: "insensitive" } },
            { address: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } }
          ]
        }
        if (filters?.parking) prismaFilters.parking = true
        if (filters?.cafeteria) prismaFilters.cafeteria = true
        if (filters?.meetingRooms) prismaFilters.meetingRooms = true
        if (filters?.chargingPorts) prismaFilters.chargingPorts = true
        if (filters?.noiseLevel && filters.noiseLevel !== "Any") prismaFilters.noiseLevel = filters.noiseLevel

        const dbWorkspaces = await prisma.workspace.findMany({
          where: prismaFilters,
          include: {
            reviews: true
          }
        })

        // Map Prisma DB schema back to TS client format if key properties mapping needed
        const workspaces: Workspace[] = dbWorkspaces.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          address: w.address,
          latitude: w.latitude,
          longitude: w.longitude,
          pricePerDay: w.pricePerDay,
          pricePerMonth: w.pricePerMonth,
          wifiSpeed: w.wifiSpeed,
          parking: w.parking,
          cafeteria: w.cafeteria,
          meetingRooms: w.meetingRooms,
          chargingPorts: w.chargingPorts,
          noiseLevel: w.noiseLevel,
          washroomRating: w.washroomRating,
          trafficScore: w.trafficScore,
          metroDistance: w.metroDistance,
          availableSeats: w.availableSeats,
          rating: w.rating,
          images: w.images,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
          reviews: w.reviews.map(r => ({
            id: r.id,
            userId: r.userId,
            workspaceId: r.workspaceId,
            rating: r.rating,
            comment: r.comment,
            pros: r.pros,
            cons: r.cons,
            createdAt: r.createdAt.toISOString()
          }))
        }))

        // Compute scores
        const recommendations = workspaces.map(w => 
          computeRecommendationScore(w, undefined, filters?.budget)
        ).sort((a, b) => b.score - a.score)

        return { workspaces, recommendations }
      } catch (err) {
        console.error("Prisma query failed, falling back to mock DB...", err)
      }
    }

    // MOCK DATABASE FALLBACK
    const mockData = mockDb.getData()
    let filtered = [...mockData.workspaces]

    // Apply filtering
    if (filters) {
      if (filters.city && filters.city !== "All Cities") {
        filtered = filtered.filter(w => 
          w.address.toLowerCase().includes(filters.city!.toLowerCase())
        )
      }
      if (filters.search) {
        const query = filters.search.toLowerCase()
        filtered = filtered.filter(w => 
          w.name.toLowerCase().includes(query) || 
          w.address.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query)
        )
      }
      if (filters.parking) {
        filtered = filtered.filter(w => w.parking)
      }
      if (filters.cafeteria) {
        filtered = filtered.filter(w => w.cafeteria)
      }
      if (filters.meetingRooms) {
        filtered = filtered.filter(w => w.meetingRooms)
      }
      if (filters.chargingPorts) {
        filtered = filtered.filter(w => w.chargingPorts)
      }
      if (filters.noiseLevel && filters.noiseLevel !== "Any") {
        filtered = filtered.filter(w => w.noiseLevel === filters.noiseLevel)
      }
      if (filters.wifiSpeed) {
        filtered = filtered.filter(w => w.wifiSpeed >= filters.wifiSpeed!)
      }
      if (filters.metroNearby) {
        filtered = filtered.filter(w => w.metroDistance <= 1.0)
      }
      if (filters.twentyFourSeven) {
        // Mock filter - even workspaces always have 24/7 access in details
        filtered = filtered.filter((_, idx) => idx % 2 === 0)
      }
      if (filters.silentWorkspace) {
        filtered = filtered.filter(w => w.noiseLevel === "Low")
      }
    }

    // Add reviews
    const workspacesWithReviews = filtered.map(w => {
      const reviews = mockData.reviews.filter(r => r.workspaceId === w.id)
      return { ...w, reviews }
    })

    // Compute recommendation scores
    const recommendations = workspacesWithReviews.map(w => 
      computeRecommendationScore(w, undefined, filters?.budget)
    ).sort((a, b) => b.score - a.score)

    return { 
      workspaces: workspacesWithReviews, 
      recommendations 
    }
  },

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    if (isDbConnected()) {
      try {
        const w = await prisma.workspace.findUnique({
          where: { id },
          include: { reviews: { include: { user: true } } }
        })
        if (w) {
          return {
            id: w.id,
            name: w.name,
            description: w.description,
            address: w.address,
            latitude: w.latitude,
            longitude: w.longitude,
            pricePerDay: w.pricePerDay,
            pricePerMonth: w.pricePerMonth,
            wifiSpeed: w.wifiSpeed,
            parking: w.parking,
            cafeteria: w.cafeteria,
            meetingRooms: w.meetingRooms,
            chargingPorts: w.chargingPorts,
            noiseLevel: w.noiseLevel,
            washroomRating: w.washroomRating,
            trafficScore: w.trafficScore,
            metroDistance: w.metroDistance,
            availableSeats: w.availableSeats,
            rating: w.rating,
            images: w.images,
            createdAt: w.createdAt.toISOString(),
            updatedAt: w.updatedAt.toISOString(),
            reviews: w.reviews.map(r => ({
              id: r.id,
              userId: r.userId,
              workspaceId: r.workspaceId,
              rating: r.rating,
              comment: r.comment,
              pros: r.pros,
              cons: r.cons,
              createdAt: r.createdAt.toISOString(),
              user: r.user ? {
                id: r.user.id,
                email: r.user.email,
                name: r.user.name,
                photoUrl: r.user.photoUrl,
                preferredBudget: r.user.preferredBudget,
                preferredAmenities: r.user.preferredAmenities,
                createdAt: r.user.createdAt.toISOString(),
                updatedAt: r.user.updatedAt.toISOString()
              } : undefined
            }))
          }
        }
      } catch (err) {
        console.error("Prisma getWorkspaceById failed, fallback to mock DB", err)
      }
    }

    const mockData = mockDb.getData()
    const ws = mockData.workspaces.find(w => w.id === id)
    if (!ws) return null

    const reviews = mockData.reviews
      .filter(r => r.workspaceId === id)
      .map(r => {
        const reviewer = mockData.users.find(u => u.id === r.userId) || {
          id: r.userId,
          name: "Anonymous User",
          email: "anon@coworkiq.com",
          photoUrl: null,
          preferredBudget: null,
          preferredAmenities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        return { ...r, user: reviewer }
      })

    return { ...ws, reviews }
  },

  async createWorkspace(workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt" | "rating">): Promise<Workspace> {
    const newWorkspace: Workspace = {
      id: `space-${Date.now()}`,
      rating: 0.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...workspace
    }

    if (isDbConnected()) {
      try {
        const created = await prisma.workspace.create({
          data: {
            name: newWorkspace.name,
            description: newWorkspace.description,
            address: newWorkspace.address,
            latitude: newWorkspace.latitude,
            longitude: newWorkspace.longitude,
            pricePerDay: newWorkspace.pricePerDay,
            pricePerMonth: newWorkspace.pricePerMonth,
            wifiSpeed: newWorkspace.wifiSpeed,
            parking: newWorkspace.parking,
            cafeteria: newWorkspace.cafeteria,
            meetingRooms: newWorkspace.meetingRooms,
            chargingPorts: newWorkspace.chargingPorts,
            noiseLevel: newWorkspace.noiseLevel,
            washroomRating: newWorkspace.washroomRating,
            trafficScore: newWorkspace.trafficScore,
            metroDistance: newWorkspace.metroDistance,
            availableSeats: newWorkspace.availableSeats,
            images: newWorkspace.images
          }
        })
        return {
          ...newWorkspace,
          id: created.id,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString()
        }
      } catch (err) {
        console.error("Prisma createWorkspace failed, executing on mock DB", err)
      }
    }

    mockDb.saveWorkspace(newWorkspace)
    return newWorkspace
  },

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | null> {
    if (isDbConnected()) {
      try {
        const updated = await prisma.workspace.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            pricePerDay: data.pricePerDay,
            pricePerMonth: data.pricePerMonth,
            wifiSpeed: data.wifiSpeed,
            parking: data.parking,
            cafeteria: data.cafeteria,
            meetingRooms: data.meetingRooms,
            chargingPorts: data.chargingPorts,
            noiseLevel: data.noiseLevel,
            washroomRating: data.washroomRating,
            trafficScore: data.trafficScore,
            metroDistance: data.metroDistance,
            availableSeats: data.availableSeats,
            images: data.images
          }
        })
        return {
          ...data,
          id: updated.id,
          name: updated.name,
          description: updated.description,
          address: updated.address,
          latitude: updated.latitude,
          longitude: updated.longitude,
          pricePerDay: updated.pricePerDay,
          pricePerMonth: updated.pricePerMonth,
          wifiSpeed: updated.wifiSpeed,
          parking: updated.parking,
          cafeteria: updated.cafeteria,
          meetingRooms: updated.meetingRooms,
          chargingPorts: updated.chargingPorts,
          noiseLevel: updated.noiseLevel,
          washroomRating: updated.washroomRating,
          trafficScore: updated.trafficScore,
          metroDistance: updated.metroDistance,
          availableSeats: updated.availableSeats,
          rating: updated.rating,
          images: updated.images,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString()
        } as Workspace
      } catch (err) {
        console.error("Prisma updateWorkspace failed, executing on mock DB", err)
      }
    }

    const current = await this.getWorkspaceById(id)
    if (!current) return null
    const merged = { ...current, ...data }
    mockDb.saveWorkspace(merged)
    return merged
  },

  async deleteWorkspace(id: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await prisma.workspace.delete({ where: { id } })
        return true
      } catch (err) {
        console.error("Prisma deleteWorkspace failed", err)
      }
    }
    mockDb.deleteWorkspace(id)
    return true
  },

  // BOOKINGS
  async getBookings(userId: string): Promise<Booking[]> {
    if (isDbConnected()) {
      try {
        const bookings = await prisma.booking.findMany({
          where: { userId },
          include: { workspace: true }
        })
        return bookings.map(b => ({
          id: b.id,
          userId: b.userId,
          workspaceId: b.workspaceId,
          date: b.date.toISOString(),
          time: b.time,
          teamSize: b.teamSize,
          purpose: b.purpose,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          workspace: b.workspace ? {
            ...b.workspace,
            createdAt: b.workspace.createdAt.toISOString(),
            updatedAt: b.workspace.updatedAt.toISOString()
          } : undefined
        }))
      } catch (err) {
        console.error("Prisma getBookings failed", err)
      }
    }

    const mockData = mockDb.getData()
    return mockData.bookings
      .filter(b => b.userId === userId)
      .map(b => {
        const ws = mockData.workspaces.find(w => w.id === b.workspaceId)
        return { ...b, workspace: ws }
      })
  },

  async getAllBookings(): Promise<Booking[]> {
    if (isDbConnected()) {
      try {
        const bookings = await prisma.booking.findMany({
          include: { workspace: true, user: true }
        })
        return bookings.map(b => ({
          id: b.id,
          userId: b.userId,
          workspaceId: b.workspaceId,
          date: b.date.toISOString(),
          time: b.time,
          teamSize: b.teamSize,
          purpose: b.purpose,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          workspace: b.workspace ? {
            ...b.workspace,
            createdAt: b.workspace.createdAt.toISOString(),
            updatedAt: b.workspace.updatedAt.toISOString()
          } : undefined,
          user: b.user ? {
            id: b.user.id,
            email: b.user.email,
            name: b.user.name,
            photoUrl: b.user.photoUrl,
            preferredBudget: b.user.preferredBudget,
            preferredAmenities: b.user.preferredAmenities,
            createdAt: b.user.createdAt.toISOString(),
            updatedAt: b.user.updatedAt.toISOString()
          } : undefined
        }))
      } catch (err) {
        console.error("Prisma getAllBookings failed", err)
      }
    }

    const mockData = mockDb.getData()
    return mockData.bookings.map(b => {
      const ws = mockData.workspaces.find(w => w.id === b.workspaceId)
      const user = mockData.users.find(u => u.id === b.userId)
      return { ...b, workspace: ws, user }
    })
  },

  async createBooking(booking: Omit<Booking, "id" | "createdAt" | "status">): Promise<Booking> {
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
      ...booking
    }

    if (isDbConnected()) {
      try {
        const b = await prisma.booking.create({
          data: {
            userId: newBooking.userId,
            workspaceId: newBooking.workspaceId,
            date: new Date(newBooking.date),
            time: newBooking.time,
            teamSize: newBooking.teamSize,
            purpose: newBooking.purpose,
            status: newBooking.status
          }
        })
        return {
          ...newBooking,
          id: b.id,
          createdAt: b.createdAt.toISOString()
        }
      } catch (err) {
        console.error("Prisma createBooking failed", err)
      }
    }

    mockDb.saveBooking(newBooking)
    return newBooking
  },

  async updateBookingStatus(id: string, status: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await prisma.booking.update({
          where: { id },
          data: { status }
        })
        return true
      } catch (err) {
        console.error("Prisma updateBookingStatus failed", err)
      }
    }

    const mockData = mockDb.getData()
    const booking = mockData.bookings.find(b => b.id === id)
    if (booking) {
      booking.status = status
      mockDb.saveBooking(booking)
      return true
    }
    return false
  },

  // FAVORITES
  async getFavorites(userId: string): Promise<Workspace[]> {
    if (isDbConnected()) {
      try {
        const favs = await prisma.favorite.findMany({
          where: { userId },
          include: { workspace: true }
        })
        return favs.map(f => ({
          id: f.workspace.id,
          name: f.workspace.name,
          description: f.workspace.description,
          address: f.workspace.address,
          latitude: f.workspace.latitude,
          longitude: f.workspace.longitude,
          pricePerDay: f.workspace.pricePerDay,
          pricePerMonth: f.workspace.pricePerMonth,
          wifiSpeed: f.workspace.wifiSpeed,
          parking: f.workspace.parking,
          cafeteria: f.workspace.cafeteria,
          meetingRooms: f.workspace.meetingRooms,
          chargingPorts: f.workspace.chargingPorts,
          noiseLevel: f.workspace.noiseLevel,
          washroomRating: f.workspace.washroomRating,
          trafficScore: f.workspace.trafficScore,
          metroDistance: f.workspace.metroDistance,
          availableSeats: f.workspace.availableSeats,
          rating: f.workspace.rating,
          images: f.workspace.images,
          createdAt: f.workspace.createdAt.toISOString(),
          updatedAt: f.workspace.updatedAt.toISOString()
        }))
      } catch (err) {
        console.error("Prisma getFavorites failed", err)
      }
    }

    const mockData = mockDb.getData()
    const favWorkspaceIds = mockData.favorites
      .filter(f => f.userId === userId)
      .map(f => f.workspaceId)
    
    return mockData.workspaces.filter(w => favWorkspaceIds.includes(w.id))
  },

  async toggleFavorite(userId: string, workspaceId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        const exists = await prisma.favorite.findUnique({
          where: { userId_workspaceId: { userId, workspaceId } }
        })
        if (exists) {
          await prisma.favorite.delete({
            where: { userId_workspaceId: { userId, workspaceId } }
          })
          return false // favorited: false
        } else {
          await prisma.favorite.create({
            data: { userId, workspaceId }
          })
          return true // favorited: true
        }
      } catch (err) {
        console.error("Prisma toggleFavorite failed", err)
      }
    }

    const mockData = mockDb.getData()
    const fav = { userId, workspaceId, createdAt: new Date().toISOString() }
    const exists = mockData.favorites.some(f => f.userId === userId && f.workspaceId === workspaceId)
    mockDb.saveFavorite(fav)
    return !exists
  },

  // USER PROFILE
  async getUserProfile(userId: string): Promise<User | null> {
    if (isDbConnected()) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId } })
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            photoUrl: u.photoUrl,
            preferredBudget: u.preferredBudget,
            preferredAmenities: u.preferredAmenities,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString()
          }
        }
      } catch (err) {
        console.error("Prisma getUserProfile failed", err)
      }
    }

    const mockData = mockDb.getData()
    return mockData.users.find(u => u.id === userId) || null
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User | null> {
    if (isDbConnected()) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            name: data.name,
            photoUrl: data.photoUrl,
            preferredBudget: data.preferredBudget,
            preferredAmenities: data.preferredAmenities
          }
        })
        return {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          photoUrl: updated.photoUrl,
          preferredBudget: updated.preferredBudget,
          preferredAmenities: updated.preferredAmenities,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString()
        }
      } catch (err) {
        console.error("Prisma updateUserProfile failed", err)
      }
    }

    const mockData = mockDb.getData()
    const idx = mockData.users.findIndex(u => u.id === userId)
    if (idx >= 0) {
      const merged = { ...mockData.users[idx], ...data, updatedAt: new Date().toISOString() }
      mockDb.saveUser(merged)
      return merged
    } else {
      // create user if not exists
      const newUser: User = {
        id: userId,
        email: data.email || `${userId}@coworkiq.com`,
        name: data.name || "User",
        photoUrl: data.photoUrl || null,
        preferredBudget: data.preferredBudget || 500,
        preferredAmenities: data.preferredAmenities || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockDb.saveUser(newUser)
      return newUser
    }
  },

  // REVIEWS
  async createReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...review
    }

    if (isDbConnected()) {
      try {
        const created = await prisma.review.create({
          data: {
            userId: newReview.userId,
            workspaceId: newReview.workspaceId,
            rating: newReview.rating,
            comment: newReview.comment,
            pros: newReview.pros,
            cons: newReview.cons
          }
        })
        return {
          ...newReview,
          id: created.id,
          createdAt: created.createdAt.toISOString()
        }
      } catch (err) {
        console.error("Prisma createReview failed", err)
      }
    }

    mockDb.saveReview(newReview)
    return newReview
  },

  async deleteReview(id: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await prisma.review.delete({ where: { id } })
        return true
      } catch (err) {
        console.error("Prisma deleteReview failed", err)
      }
    }
    mockDb.deleteReview(id)
    return true
  },

  // LOCATIONS
  async getLocations(): Promise<Location[]> {
    if (isDbConnected()) {
      try {
        const locs = await prisma.location.findMany()
        return locs
      } catch (err) {
        console.error("Prisma getLocations failed", err)
      }
    }
    const mockData = mockDb.getData()
    return mockData.locations
  }
}
