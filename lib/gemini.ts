import { GoogleGenAI } from "@google/genai"
import { Workspace, Review } from "../types"

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey })
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e)
      return null
    }
  }
  return aiClient
}

// ----------------------------------------------------
// 1. REVIEW SUMMARIZER
// ----------------------------------------------------
export interface ReviewSummary {
  pros: string[]
  cons: string[]
  summary: string
}

export async function summarizeReviews(reviews: Review[]): Promise<ReviewSummary> {
  if (reviews.length === 0) {
    return {
      pros: ["Quiet environment"],
      cons: ["No reviews written yet"],
      summary: "No reviews are available to summarize yet. Be the first to review!"
    }
  }

  const client = getGeminiClient()
  if (client) {
    try {
      const reviewText = reviews.map(r => `[Rating: ${r.rating}/5] Comment: ${r.comment}`).join("\n\n")
      const prompt = `You are an AI assistant summarizing coworking space reviews.
Analyze the following reviews and extract:
1. Top 3 Pros (as short bullet points, e.g., "Excellent WiFi", "Comfortable Seating").
2. Top 2 Cons (as short bullet points, e.g., "Parking fills quickly", "Noisy near cafeteria").
3. A concise 2-sentence overall summary about suitability (e.g., "Suitable for software teams and remote workers who value a quiet environment").

Respond ONLY with a JSON object in this format:
{
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "summary": "overall summary"
}

Reviews:
${reviewText}`

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      })

      const text = response.text
      if (text) {
        return JSON.parse(text) as ReviewSummary
      }
    } catch (e) {
      console.error("Gemini API error during review summarization. Falling back to local summarizer.", e)
    }
  }

  // LOCAL SIMULATED SUMMARIZER (FALLBACK)
  // Extract pros and cons programmatically from our structured review data
  const prosSet = new Set<string>()
  const consSet = new Set<string>()
  
  reviews.forEach(r => {
    if (r.pros && Array.isArray(r.pros)) r.pros.forEach(p => prosSet.add(p))
    if (r.cons && Array.isArray(r.cons)) r.cons.forEach(c => consSet.add(c))
  })

  const pros = Array.from(prosSet).slice(0, 3)
  const cons = Array.from(consSet).slice(0, 2)
  
  // Default values if empty
  if (pros.length === 0) pros.push("Reliable power backup", "High-speed WiFi", "Friendly staff")
  if (cons.length === 0) cons.push("Parking is tight", "Food options are basic")

  // Generate a realistic summary
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  let summary = ""
  if (avgRating >= 4.5) {
    summary = "Highly rated by users for its exceptional comfort, super-fast internet speed, and professional staff. Highly suitable for software engineers and small remote teams."
  } else if (avgRating >= 4.0) {
    summary = "A popular workspace offering reliable amenities, good community engagement, and convenient transport links. Best suited for freelancers and digital nomads."
  } else {
    summary = "A basic coworking space that is economical but has some challenges with noise and parking during peak hours. Best for budget-oriented workers."
  }

  return { pros, cons, summary }
}

// ----------------------------------------------------
// 2. CHATBOT ASSISTANT
// ----------------------------------------------------
export interface ChatResponse {
  text: string
  recommendedWorkspaces?: Workspace[]
}

export async function getChatbotResponse(
  userMessage: string,
  history: { role: "user" | "model"; parts: string[] }[],
  allWorkspaces: Workspace[]
): Promise<ChatResponse> {
  const client = getGeminiClient()
  
  // Prepare a highly compressed list of spaces for the model's context
  const workspaceContext = allWorkspaces.map(w => ({
    id: w.id,
    name: w.name,
    price: w.pricePerDay,
    address: w.address,
    wifiSpeed: w.wifiSpeed,
    noise: w.noiseLevel,
    rating: w.rating,
    availableSeats: w.availableSeats,
    parking: w.parking,
    cafeteria: w.cafeteria,
    meetingRooms: w.meetingRooms
  }))

  if (client) {
    try {
      const prompt = `You are CoWorking Spaces Assistant, a helpful AI guide for finding coworking spaces.
You have access to a database of 50 coworking spaces. Here is their simplified list:
${JSON.stringify(workspaceContext)}

Rules:
1. Recommend 1 to 3 coworking spaces from the list that BEST match the user's request.
2. If the user mentions a specific area (e.g., "Hitech City", "Koramangala", "Saket") or price limit (e.g. "under ₹500"), prioritize spaces matching these rules.
3. Be professional, friendly, and concise. Explain briefly why these spaces match.
4. Output your response as a JSON object in this format:
{
  "text": "Your helpful response text explaining why the selected workspaces are good.",
  "recommendedWorkspaceIds": ["space-X", "space-Y"]
}

User Message: "${userMessage}"`

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      })

      const text = response.text
      if (text) {
        const parsed = JSON.parse(text)
        const recommendedIds = parsed.recommendedWorkspaceIds || []
        const recommendedWorkspaces = allWorkspaces.filter(w => recommendedIds.includes(w.id))
        return {
          text: parsed.text,
          recommendedWorkspaces
        }
      }
    } catch (e) {
      console.error("Gemini API error in chatbot. Falling back to local RAG model.", e)
    }
  }

  // LOCAL SIMULATED CHAT ASSISTANT (FALLBACK)
  const lowerMsg = userMessage.toLowerCase()
  let filtered = [...allWorkspaces]
  
  // Filter by location keywords
  const areas = ["hitech city", "madhapur", "gachibowli", "kondapur", "jubilee hills", "koramangala", "indiranagar", "hsr layout", "whitefield", "jayanagar", "andheri", "bkc", "powai", "lower parel", "gurgaon", "noida", "connaught place", "saket"]
  const matchedArea = areas.find(area => lowerMsg.includes(area))
  if (matchedArea) {
    filtered = filtered.filter(w => w.address.toLowerCase().includes(matchedArea))
  }

  // Filter by budget
  const priceRegex = /(?:under|below|less than|within|₹|\$)\s*(\d+)/
  const priceMatch = lowerMsg.match(priceRegex)
  if (priceMatch) {
    const maxBudget = parseInt(priceMatch[1])
    filtered = filtered.filter(w => w.pricePerDay <= maxBudget)
  }

  // Filter by specific amenities
  if (lowerMsg.includes("wifi") || lowerMsg.includes("internet") || lowerMsg.includes("speed")) {
    filtered = filtered.filter(w => w.wifiSpeed >= 150)
  }
  if (lowerMsg.includes("quiet") || lowerMsg.includes("silent") || lowerMsg.includes("noise") || lowerMsg.includes("zoom")) {
    filtered = filtered.filter(w => w.noiseLevel === "Low")
  }
  if (lowerMsg.includes("parking")) {
    filtered = filtered.filter(w => w.parking)
  }
  if (lowerMsg.includes("meeting") || lowerMsg.includes("boardroom")) {
    filtered = filtered.filter(w => w.meetingRooms)
  }
  if (lowerMsg.includes("cafeteria") || lowerMsg.includes("food") || lowerMsg.includes("coffee")) {
    filtered = filtered.filter(w => w.cafeteria)
  }

  // Sort by rating and get top 3
  filtered = filtered.sort((a, b) => b.rating - a.rating)
  const topRecommendations = filtered.slice(0, 3)

  let text = ""
  if (topRecommendations.length > 0) {
    text = `Here are some excellent options that match your request:\n\n`
    topRecommendations.forEach((ws, idx) => {
      text += `${idx + 1}. **${ws.name}** in ${ws.address.split(",")[3]} for ₹${ws.pricePerDay}/day. It features a ${ws.wifiSpeed} Mbps WiFi connection and a ${ws.noiseLevel.toLowerCase()} noise level.\n`
    })
    text += `\nWould you like me to book a visit or show you directions to any of these spaces?`
  } else {
    // If no strict match, show top rated spaces
    const defaultRecommendations = allWorkspaces.slice(0, 3)
    text = `I couldn't find a direct match for that request. However, here are some of our top-rated coworking spaces overall:\n\n`
    defaultRecommendations.forEach((ws, idx) => {
      text += `${idx + 1}. **${ws.name}** (₹${ws.pricePerDay}/day, ${ws.wifiSpeed} Mbps WiFi).\n`
    })
    text += `\nLet me know if you would like to search for spaces in other areas or with different price budgets!`
    return {
      text,
      recommendedWorkspaces: defaultRecommendations
    }
  }

  return {
    text,
    recommendedWorkspaces: topRecommendations
  }
}

// ----------------------------------------------------
// 3. RECOMMENDATION EXPLAINER
// ----------------------------------------------------
export async function getRecommendationExplanation(
  workspace: Workspace,
  preferredBudget?: number
): Promise<string> {
  const client = getGeminiClient()
  const targetBudget = preferredBudget || 600

  if (client) {
    try {
      const prompt = `You are a workspace recommender AI. Explain to a user why the workspace "${workspace.name}" was recommended for them.
Workspace Details:
- Price: ₹${workspace.pricePerDay}/day (vs user target budget: ₹${targetBudget}/day)
- WiFi: ${workspace.wifiSpeed} Mbps
- Noise: ${workspace.noiseLevel} Level
- Traffic Score: ${workspace.trafficScore}/100 (lower is better traffic)
- Metro Distance: ${workspace.metroDistance} km
- Clean Washrooms: Rating ${workspace.washroomRating}/5
- Parking: ${workspace.parking ? "Available" : "Not Available"}
- Cafeteria: ${workspace.cafeteria ? "Available" : "Not Available"}

Output a simple, engaging, 1-sentence description explaining why it matches (e.g., "This workspace matches your budget, has excellent WiFi, low traffic during your selected hours, clean washrooms, and is only 5 minutes from the metro.").`

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      })

      const text = response.text
      if (text) {
        return text.trim()
      }
    } catch (e) {
      console.error("Gemini API error in explainer, falling back to rule-based explainer.", e)
    }
  }

  // LOCAL SIMULATED EXPLAINER (FALLBACK)
  const matches = []
  if (workspace.pricePerDay <= targetBudget) {
    matches.push("fits perfectly in your budget")
  } else if (workspace.pricePerDay <= targetBudget * 1.25) {
    matches.push("is slightly above your target budget but offers great value")
  }
  
  if (workspace.wifiSpeed >= 150) {
    matches.push("has blazing fast internet (${workspace.wifiSpeed} Mbps)")
  }
  
  if (workspace.noiseLevel === "Low") {
    matches.push("offers a highly peaceful, silent workspace")
  }

  if (workspace.metroDistance <= 0.8) {
    matches.push("is extremely close to the metro station (${workspace.metroDistance} km)")
  }

  if (workspace.washroomRating >= 4.2) {
    matches.push("features exceptionally hygienic washrooms")
  }

  if (workspace.parking) {
    matches.push("provides dedicated hassle-free parking")
  }

  // Combine into a sentence
  if (matches.length === 0) {
    return `This workspace offers a solid selection of basic facilities and is located in the accessible ${workspace.address.split(",")[3]} area.`
  }

  const firstFew = matches.slice(0, 3)
  const joined = firstFew.join(", ")
  return `This workspace is recommended because it ${joined.replace("has", "and has")}.`
}
