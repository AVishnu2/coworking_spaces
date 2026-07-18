import { Workspace, RecommendationResult } from "../types"

// Haversine formula to calculate distance in km between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

export function computeRecommendationScore(
  workspace: Workspace,
  searchCoords?: { latitude: number; longitude: number },
  preferredBudget?: number // daily budget
): RecommendationResult {
  const reasons: string[] = []
  
  // 1. WiFi Quality (30%)
  // Speed >= 150 Mbps gets full score, scale down below that.
  const wifiScoreRaw = Math.min(100, (workspace.wifiSpeed / 150) * 100)
  const wifiContribution = wifiScoreRaw * 0.30
  if (workspace.wifiSpeed >= 100) {
    reasons.push(`Excellent WiFi speed of ${workspace.wifiSpeed} Mbps`)
  } else if (workspace.wifiSpeed >= 50) {
    reasons.push(`Good WiFi speed of ${workspace.wifiSpeed} Mbps`)
  } else {
    reasons.push(`Standard WiFi speed of ${workspace.wifiSpeed} Mbps`)
  }

  // 2. Budget Match (20%)
  // If no budget preferred, default to a standard target like 500
  const targetBudget = preferredBudget || 600
  let budgetScoreRaw = 100
  if (workspace.pricePerDay <= targetBudget) {
    budgetScoreRaw = 100
    reasons.push(`Fully within your budget (₹${workspace.pricePerDay}/day vs ₹${targetBudget}/day preferred)`)
  } else {
    // Scale down: double the budget gets 0.
    const diff = workspace.pricePerDay - targetBudget
    budgetScoreRaw = Math.max(0, 100 - (diff / targetBudget) * 100)
    if (budgetScoreRaw >= 70) {
      reasons.push(`Slightly above budget (₹${workspace.pricePerDay}/day)`)
    } else {
      reasons.push(`Premium pricing (₹${workspace.pricePerDay}/day)`)
    }
  }
  const budgetContribution = budgetScoreRaw * 0.20

  // 3. Distance (15%)
  // Distance under 1km gets 100%. Over 10km gets 0%.
  let distanceScoreRaw = 100
  let distanceKm = 0
  if (searchCoords) {
    distanceKm = calculateDistance(
      searchCoords.latitude,
      searchCoords.longitude,
      workspace.latitude,
      workspace.longitude
    )
    if (distanceKm <= 1) {
      distanceScoreRaw = 100
    } else if (distanceKm >= 10) {
      distanceScoreRaw = 0
    } else {
      distanceScoreRaw = 100 - ((distanceKm - 1) / 9) * 100
    }

    if (distanceKm <= 1.5) {
      reasons.push(`Very close to your location (${distanceKm.toFixed(1)} km)`)
    } else if (distanceKm <= 5) {
      reasons.push(`Convenient distance (${distanceKm.toFixed(1)} km)`)
    } else {
      reasons.push(`Located further away (${distanceKm.toFixed(1)} km)`)
    }
  } else {
    // If no search coords, fallback to distance in DB (metroDistance)
    const dist = workspace.metroDistance
    if (dist <= 0.5) {
      distanceScoreRaw = 100
      reasons.push(`Extremely close to metro station (${dist * 1000}m)`)
    } else if (dist <= 2) {
      distanceScoreRaw = 80
      reasons.push(`Close to metro station (${dist.toFixed(1)} km)`)
    } else {
      distanceScoreRaw = 40
      reasons.push(`Metro is a bit far (${dist.toFixed(1)} km)`)
    }
  }
  const distanceContribution = distanceScoreRaw * 0.15

  // 4. Traffic Score (10%)
  // Traffic score in workspace is 0 to 100 (lower is better, e.g., low traffic congestion)
  // Low congestion (0-30) -> High Score. High congestion (70-100) -> Low Score.
  const trafficScoreRaw = Math.max(0, 100 - workspace.trafficScore)
  const trafficContribution = trafficScoreRaw * 0.10
  if (workspace.trafficScore <= 30) {
    reasons.push("Very low traffic area, easy commute")
  } else if (workspace.trafficScore <= 65) {
    reasons.push("Moderate traffic during peak hours")
  } else {
    reasons.push("Heavy peak-hour traffic zone")
  }

  // 5. Noise Level (10%)
  let noiseScoreRaw = 50
  if (workspace.noiseLevel === "Low") {
    noiseScoreRaw = 100
    reasons.push("Very quiet environment suitable for meetings")
  } else if (workspace.noiseLevel === "Medium") {
    noiseScoreRaw = 70
    reasons.push("Moderate ambient noise, good energetic vibe")
  } else {
    noiseScoreRaw = 30
    reasons.push("Livelier, slightly louder environment")
  }
  const noiseContribution = noiseScoreRaw * 0.10

  // 6. Washroom Rating (5%)
  // Rating 5/5 -> 100%
  const washroomScoreRaw = (workspace.washroomRating / 5) * 100
  const washroomContribution = washroomScoreRaw * 0.05
  if (workspace.washroomRating >= 4.5) {
    reasons.push("Exceptionally clean and well-maintained washrooms")
  } else if (workspace.washroomRating >= 3.5) {
    reasons.push("Clean washrooms")
  } else {
    reasons.push("Average washroom hygiene")
  }

  // 7. Cafeteria Rating (5%)
  // If workspace has cafeteria -> 100%, otherwise 0%
  const cafeteriaScoreRaw = workspace.cafeteria ? 100 : 0
  const cafeteriaContribution = cafeteriaScoreRaw * 0.05
  if (workspace.cafeteria) {
    reasons.push("In-house cafeteria available for quick meals")
  }

  // 8. Parking (5%)
  // Has parking -> 100%, otherwise 0%
  const parkingScoreRaw = workspace.parking ? 100 : 0
  const parkingContribution = parkingScoreRaw * 0.05
  if (workspace.parking) {
    reasons.push("Dedicated parking slots available")
  } else {
    reasons.push("Street parking or public parking nearby")
  }

  // Calculate final score
  const finalScore = Math.round(
    wifiContribution +
    budgetContribution +
    distanceContribution +
    trafficContribution +
    noiseContribution +
    washroomContribution +
    cafeteriaContribution +
    parkingContribution
  )

  return {
    workspace,
    score: finalScore,
    reasons: reasons.slice(0, 5), // Keep top 5 reasons
    scoreBreakdown: {
      wifi: Math.round(wifiScoreRaw),
      budget: Math.round(budgetScoreRaw),
      distance: Math.round(distanceScoreRaw),
      traffic: Math.round(trafficScoreRaw),
      noise: Math.round(noiseScoreRaw),
      washroom: Math.round(washroomScoreRaw),
      cafeteria: Math.round(cafeteriaScoreRaw),
      parking: Math.round(parkingScoreRaw)
    }
  }
}
