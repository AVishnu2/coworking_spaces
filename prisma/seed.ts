import { PrismaClient } from "@prisma/client"
import { 
  generateWorkspaces, 
  generateReviews, 
  MOCK_AMENITIES, 
  MOCK_LOCATIONS 
} from "../lib/seedData.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // 1. Clean existing database records
  console.log("Cleaning database...")
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.workspaceAmenity.deleteMany()
  await prisma.amenity.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // 2. Insert standard locations
  console.log("Seeding locations...")
  for (const loc of MOCK_LOCATIONS) {
    await prisma.location.create({
      data: {
        city: loc.city,
        area: loc.area,
        latitude: loc.latitude,
        longitude: loc.longitude
      }
    })
  }

  // 3. Insert standard amenities
  console.log("Seeding amenities...")
  const amenityMap: Record<string, string> = {}
  for (const a of MOCK_AMENITIES) {
    const created = await prisma.amenity.create({
      data: {
        name: a.name,
        icon: a.icon
      }
    })
    amenityMap[a.name] = created.id
  }

  // 4. Insert default users
  console.log("Seeding users...")
  const users = [
    {
      id: "user-mock-demouser",
      email: "demo@coworkiq.com",
      name: "Demo User",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      preferredBudget: 500,
      preferredAmenities: ["High-Speed WiFi", "Air Conditioning", "Silent Zones"]
    },
    {
      id: "user-mock-admin",
      email: "admin@coworkingspaces.com",
      name: "CoWorking Spaces Admin",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      preferredBudget: 1000,
      preferredAmenities: ["Meeting Rooms", "Dedicated Parking"]
    }
  ]

  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        name: u.name,
        photoUrl: u.photoUrl,
        preferredBudget: u.preferredBudget,
        preferredAmenities: u.preferredAmenities
      }
    })
  }

  // 5. Insert workspaces
  console.log("Seeding workspaces...")
  const workspaces = generateWorkspaces()
  for (const ws of workspaces) {
    const createdWs = await prisma.workspace.create({
      data: {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        address: ws.address,
        latitude: ws.latitude,
        longitude: ws.longitude,
        pricePerDay: ws.pricePerDay,
        pricePerMonth: ws.pricePerMonth,
        wifiSpeed: ws.wifiSpeed,
        parking: ws.parking,
        cafeteria: ws.cafeteria,
        meetingRooms: ws.meetingRooms,
        chargingPorts: ws.chargingPorts,
        noiseLevel: ws.noiseLevel,
        washroomRating: ws.washroomRating,
        trafficScore: ws.trafficScore,
        metroDistance: ws.metroDistance,
        availableSeats: ws.availableSeats,
        rating: ws.rating,
        images: ws.images
      }
    })

    // Randomly assign 4-6 amenities to each workspace
    const seed = createdWs.name.length
    const shuffled = Object.keys(amenityMap).sort(() => 0.5 - (Math.sin(seed) - Math.floor(Math.sin(seed))))
    const selectedAmenities = shuffled.slice(0, 4 + (seed % 3))

    for (const name of selectedAmenities) {
      await prisma.workspaceAmenity.create({
        data: {
          workspaceId: createdWs.id,
          amenityId: amenityMap[name]
        }
      })
    }
  }

  // 6. Insert reviews
  console.log("Seeding reviews...")
  const reviews = generateReviews(workspaces)
  for (const r of reviews) {
    // Check if user exists in DB, if not create a mock user record first
    const userExists = await prisma.user.findUnique({
      where: { id: r.userId }
    })
    
    if (!userExists) {
      const email = `${r.userId.replace("user-mock-", "")}@gmail.com`
      const name = r.userId.replace("user-mock-", "").toUpperCase()
      await prisma.user.create({
        data: {
          id: r.userId,
          email,
          name,
          preferredBudget: 500,
          preferredAmenities: []
        }
      })
    }

    await prisma.review.create({
      data: {
        id: r.id,
        userId: r.userId,
        workspaceId: r.workspaceId,
        rating: r.rating,
        comment: r.comment,
        pros: r.pros,
        cons: r.cons
      }
    })
  }

  console.log("✅ Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
