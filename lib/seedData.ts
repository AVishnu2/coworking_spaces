import { Workspace, Review, Amenity, Location } from "../types"

export const MOCK_AMENITIES: Omit<Amenity, "id">[] = [
  { name: "High-Speed WiFi", icon: "Wifi" },
  { name: "Meeting Rooms", icon: "Video" },
  { name: "Dedicated Parking", icon: "Car" },
  { name: "In-house Cafeteria", icon: "Coffee" },
  { name: "Power Backup", icon: "Zap" },
  { name: "24/7 Access", icon: "Clock" },
  { name: "Silent Zones", icon: "VolumeX" },
  { name: "Metro Proximity", icon: "Train" },
  { name: "Wheelchair Accessible", icon: "Accessibility" },
  { name: "Pet Friendly", icon: "Dog" },
  { name: "Air Conditioning", icon: "Wind" },
  { name: "Ergonomic Chairs", icon: "Armchair" },
  { name: "Printing Station", icon: "Printer" },
  { name: "Lounge Area", icon: "Smile" }
]

export const MOCK_LOCATIONS: Omit<Location, "id">[] = [
  // Hyderabad (Hitech City, Madhapur, Gachibowli, Kondapur, Jubilee Hills)
  { city: "Hyderabad", area: "Hitech City", latitude: 17.4483, longitude: 78.3741 },
  { city: "Hyderabad", area: "Madhapur", latitude: 17.4416, longitude: 78.3809 },
  { city: "Hyderabad", area: "Gachibowli", latitude: 17.4401, longitude: 78.3489 },
  { city: "Hyderabad", area: "Kondapur", latitude: 17.4622, longitude: 78.3568 },
  { city: "Hyderabad", area: "Jubilee Hills", latitude: 17.4312, longitude: 78.4069 },
  // Bengaluru (Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar)
  { city: "Bengaluru", area: "Koramangala", latitude: 12.9352, longitude: 77.6244 },
  { city: "Bengaluru", area: "Indiranagar", latitude: 12.9719, longitude: 77.6412 },
  { city: "Bengaluru", area: "HSR Layout", latitude: 12.9105, longitude: 77.6450 },
  { city: "Bengaluru", area: "Whitefield", latitude: 12.9698, longitude: 77.7499 },
  { city: "Bengaluru", area: "Jayanagar", latitude: 12.9250, longitude: 77.5897 },
  // Mumbai (Andheri West, Bandra Kurla Complex, Powai, Lower Parel)
  { city: "Mumbai", area: "Andheri West", latitude: 19.1197, longitude: 72.8468 },
  { city: "Mumbai", area: "Bandra Kurla Complex", latitude: 19.0607, longitude: 72.8614 },
  { city: "Mumbai", area: "Powai", latitude: 19.1176, longitude: 72.9060 },
  { city: "Mumbai", area: "Lower Parel", latitude: 18.9953, longitude: 72.8296 },
  // Delhi/NCR (Gurgaon Sector 44, Noida Sector 62, Connaught Place, Saket)
  { city: "Delhi/NCR", area: "Gurgaon Sector 44", latitude: 28.4529, longitude: 77.0700 },
  { city: "Delhi/NCR", area: "Noida Sector 62", latitude: 28.6273, longitude: 77.3725 },
  { city: "Delhi/NCR", area: "Connaught Place", latitude: 28.6304, longitude: 77.2177 },
  { city: "Delhi/NCR", area: "Saket", latitude: 28.5244, longitude: 77.2066 }
]

const BRAND_NAMES = [
  "WeWork", "Innov8", "Awfis", "Cowrks", "91springboard", "The Hive", "IndiQube", 
  "BHIVE", "Social", "Workafella", "Regus", "Spaces", "Collabera", "Garage Coworking"
]

const ADJECTIVES = [
  "Elite", "Prime", "Premium", "Smart", "Hub", "Desk", "Zen", "Pulse", "Focus", "Vibe",
  "Hive", "Connect", "Circle", "Nexus", "Studio", "Launchpad", "Core", "Haven"
]

// Seeded static images matching coworking spaces
const WORKSPACE_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571624436279-b272f77ee62a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-4817e4776184?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1570126618983-dd7519998a74?auto=format&fit=crop&w=800&q=80"
]

const REVIEW_COMMENTS_GOOD = [
  {
    comment: "This coworking space is an absolute dream for remote developers. The WiFi is blazing fast, averaging 150 Mbps download. Quiet zones are respected, and the washrooms are remarkably clean.",
    pros: ["Fast WiFi", "Quiet zones", "Clean washrooms"],
    cons: ["Limited parking space"]
  },
  {
    comment: "Excellent budget option. Love the energetic environment and the community events organized here. Cafeteria serves great coffee, and metro station is just 5 minutes walk away.",
    pros: ["Metro proximity", "Great coffee", "Active community"],
    cons: ["Slightly noisy during peak hours"]
  },
  {
    comment: "Best workspace in the area. High ergonomic chairs, plenty of power outlets, and great meeting rooms. Power backup has been seamless.",
    pros: ["Ergonomic seating", "Plenty of ports", "Reliable backup"],
    cons: ["Cafeteria prices are slightly high"]
  },
  {
    comment: "Extremely tidy, super friendly staff, and very well-lit workspace. Highly recommend the dedicated desks which come with individual storage.",
    pros: ["Friendly staff", "Excellent lighting", "Dedicated storage"],
    cons: ["Requires booking meeting rooms well in advance"]
  }
]

const REVIEW_COMMENTS_BAD = [
  {
    comment: "The WiFi speed is decent but keeps disconnecting. Noise levels are quite high because the partition walls are thin. Cafeteria options are overpriced.",
    pros: ["Location is great", "Good lighting"],
    cons: ["WiFi disconnects", "High noise levels", "Expensive food"]
  },
  {
    comment: "Not satisfied with the hygiene. The washrooms need frequent cleaning. Parking is a huge hassle and they charge extra for it.",
    pros: ["Comfortable desks"],
    cons: ["Washroom hygiene", "Parking charges", "Unhelpful support"]
  }
]

export function generateWorkspaces(): Workspace[] {
  const workspaces: Workspace[] = []
  
  // Seed random generator to keep it consistent
  let seed = 12345
  function random(): number {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)]
  }

  // Generate 50 items
  for (let i = 1; i <= 50; i++) {
    const loc = MOCK_LOCATIONS[(i - 1) % MOCK_LOCATIONS.length]
    
    // Spread coordinates slightly so they aren't directly on top of each other
    const latOffset = (random() - 0.5) * 0.015
    const lonOffset = (random() - 0.5) * 0.015
    const latitude = loc.latitude + latOffset
    const longitude = loc.longitude + lonOffset

    const brand = getRandomElement(BRAND_NAMES)
    const adj = getRandomElement(ADJECTIVES)
    const name = `${brand} ${adj} - ${loc.area}`

    // Base pricing calculations
    const isPremium = random() > 0.7
    const pricePerDay = isPremium
      ? Math.round(700 + random() * 500)
      : Math.round(250 + random() * 400)
    const pricePerMonth = Math.round(pricePerDay * 20 * 0.85) // 15% discount for monthly

    const wifiSpeed = Math.round(50 + random() * 250) // 50 to 300 Mbps
    const noiseLevel = getRandomElement(["Low", "Medium", "High"])
    const washroomRating = Number((3.5 + random() * 1.5).toFixed(1))
    const trafficScore = Math.round(10 + random() * 80) // 10 to 90
    const metroDistance = Number((0.2 + random() * 3.5).toFixed(1))
    const availableSeats = Math.round(3 + random() * 45)

    // Amenities (Ensure we always have WiFi and AC, others random)
    const parking = random() > 0.4
    const cafeteria = random() > 0.3
    const meetingRooms = random() > 0.3
    const chargingPorts = true

    // Images
    const img1 = WORKSPACE_IMAGES[(i - 1) % WORKSPACE_IMAGES.length]
    const img2 = WORKSPACE_IMAGES[(i) % WORKSPACE_IMAGES.length]
    const img3 = WORKSPACE_IMAGES[(i + 1) % WORKSPACE_IMAGES.length]

    const description = `Welcome to ${name}, a premier workspace designed to cater to freelancers, startups, and remote workers. Nestled in the heart of ${loc.area}, this coworking space features top-tier modern facilities, pristine ergonomic setups, and a highly collaborative community. Enjoy seamless connectivity with our ${wifiSpeed} Mbps business internet, host productive brainstorming sessions in our modern glass-walled boardrooms, or enjoy a fresh cup of coffee at the cafeteria. Easily accessible from the nearest metro station (${metroDistance} km away).`

    workspaces.push({
      id: `space-${i}`,
      name,
      description,
      address: `Plot No. ${100 + i}, Phase ${i % 3 === 0 ? 'I' : 'II'}, Near ${loc.area} Metro Hub, ${loc.area}, ${loc.city}, India`,
      latitude,
      longitude,
      pricePerDay,
      pricePerMonth,
      wifiSpeed,
      parking,
      cafeteria,
      meetingRooms,
      chargingPorts,
      noiseLevel,
      washroomRating,
      trafficScore,
      metroDistance,
      availableSeats,
      rating: Number((4.0 + random() * 0.9).toFixed(1)),
      images: [img1, img2, img3],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return workspaces
}

export function generateReviews(workspaces: Workspace[]): Review[] {
  const reviews: Review[] = []
  let seed = 98765
  function random(): number {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)]
  }

  const userNames = ["Aarav", "Ananya", "Rahul", "Priya", "Vikram", "Sneha", "Aditya", "Neha", "Rohan", "Tanvi"]

  workspaces.forEach((ws, idx) => {
    // Generate 3 to 5 reviews per workspace
    const numReviews = Math.floor(3 + random() * 3)
    for (let r = 1; r <= numReviews; r++) {
      const isGood = random() > 0.25
      const rating = isGood ? Math.floor(4 + random() * 2) : Math.floor(2 + random() * 2)
      
      const commentTemplate = isGood 
        ? getRandomElement(REVIEW_COMMENTS_GOOD)
        : getRandomElement(REVIEW_COMMENTS_BAD)
      
      const userName = getRandomElement(userNames)
      const reviewText = `Review by ${userName}: ${commentTemplate.comment}`

      reviews.push({
        id: `review-${idx + 1}-${r}`,
        userId: `user-mock-${userName.toLowerCase()}`,
        workspaceId: ws.id,
        rating,
        comment: reviewText,
        pros: commentTemplate.pros,
        cons: commentTemplate.cons,
        createdAt: new Date(Date.now() - (r * 24 * 60 * 60 * 1000)).toISOString()
      })
    }
  })

  return reviews
}
