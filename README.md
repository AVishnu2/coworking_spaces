# CoWorkIQ – AI-Powered Smart Workspace Recommendation Platform

CoWorkIQ is a modern, production-ready SaaS dashboard designed to help startups, freelancers, remote workers, and digital nomads discover and compare coworking spaces based on real-world factors.

Instead of generic ratings, CoWorkIQ uses a weighted **AI Recommendation Score** to match spaces to user preferences, alongside interactive chatbot assistants, review summarizers, comparisons, and live scheduler bookings.

## 🚀 Key Features

1. **Authentication**: Credentials signup/login, forgot password, and Google Auth simulation.
2. **Dashboard**: Greeting, quick search, recent views, nearby spaces, and visual pins.
3. **Smart Search & Filters**: Filter by budget, team size, wifi speed, metro distance, noise level, parking, cafeteria, 24/7 access, and silent zones.
4. **AI Recommendation Engine**: Computes custom recommendation match score based on:
   - **30%** WiFi speed
   - **20%** Preferred daily budget match
   - **15%** Distance proximity to search location
   - **10%** Commute traffic density
   - **10%** Noise zone levels
   - **5%** Washroom hygiene rating
   - **5%** Cafeteria rating
   - **5%** Dedicated parking availability
5. **AI Review Summarizer**: Connects to the Google Gemini API to parse hundreds of user reviews into structured Pros, Cons, and overall suitability descriptions.
6. **AI Chatbot Assistant**: A floating chat panel to find spaces contextually (e.g. *"I need a coworking space under ₹500 near Hitech City"*).
7. **Workspace Comparison**: Side-by-side spec sheet comparison for up to 3 selected spaces.
8. **Visit Scheduler**: Book inspection visits (date, slot, team size, purpose) and monitor status.
9. **Interactive Map Widget**: Styled interactive visual map showing coordinate pins and tooltips.
10. **Admin Panel**: CRUD workspaces, approve/reject visit bookings, and moderate reviews.

--- 

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI Styling**: Tailwind CSS + Custom Glassmorphism Theme
- **Database**: Supabase PostgreSQL / Prisma ORM
- **Authentication**: Supabase Auth (simulated mockup wrapper)
- **AI Integration**: Google Gemini API (`@google/genai`)

---

## 📂 Project Structure

```
├── /prisma
│   ├── schema.prisma   # PostgreSQL Database Schema
│   └── seed.ts         # Seeding script for 50 workspaces, reviews, and amenities
├── /app
│   ├── layout.tsx      # Global theme wrappers and layout providers
│   ├── page.tsx        # Product landing page
│   ├── login/page.tsx  # Login forms
│   ├── signup/page.tsx # Registration forms
│   ├── dashboard/      # Main workspace listings, search, and map
│   ├── workspace/[id]/ # Location details, AI reviews summarizer, bookings
│   ├── compare/        # Tabular comparison board
│   ├── favorites/      # Favorited locations viewer
│   ├── profile/        # User preference configurations & booking history
│   ├── admin/          # Admin CRUD, bookings, and review moderation lists
│   └── api/chat/       # Chatbot API route
├── /components
│   ├── ui/             # Core visual elements (button, card, dialog)
│   ├── ai/             # Floating chatbot panel
│   ├── workspace/      # Cards and Booking Visit Modal
│   ├── Navbar.tsx      # Global responsive header
│   └── ThemeProvider.tsx # Light / Dark mode wrapper
├── /lib
│   ├── dbService.ts    # Transparent Live DB / Mock JSON DB fallback service
│   ├── seedData.ts     # Procedural seed generator (50 realistic records)
│   ├── recommendation.ts # Recommendation score weighted formula
│   ├── gemini.ts       # Gemini API client wrapper and local RAG fallback
│   ├── supabase.ts     # Supabase client and mockup Auth session controller
│   └── utils.ts        # CN style merger
└── /types
    └── index.ts        # TypeScript models
```

---

## ⚙️ Quick Start (Zero-Friction Dev Mode)

The platform is designed to run **out-of-the-box** without any PostgreSQL database clusters or Gemini API keys. 

If no keys are found in your `.env` file:
1. **Mock Persistent Database**: The app writes and reads to `lib/mock_db.json` automatically, retaining changes (created workspaces, bookings, favorites) across restarts.
2. **Mock AI Engine**: Computes recommendations, generates pros/cons, and provides intelligent chatbot answers using local pattern-matching algorithms.
3. **Mock Map Widget**: Renders a gorgeous CSS coordinate map with custom interactive pins.

### Setup Instructions

1. **Clone the workspace** and navigate to the project directory:
   ```bash
   npm install
   ```

2. **Run the developer server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔌 Hooking Up Live Services (Production Setup)

When you are ready to transition to production:

### 1. Database Connection (Supabase PostgreSQL)
1. Set up a PostgreSQL database (e.g. via Supabase).
2. Add your connection string in your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.supabase.co:5432/postgres?schema=public"
   ```
3. Push your schema:
   ```bash
   npx prisma db push
   ```
4. Seed the database with the 50 workspaces:
   ```bash
   npx tsx prisma/seed.ts
   ```

### 2. Configure Google Gemini API
Provide your Google Gemini API key to enable live review summarization and chatbot conversations:
```env
GEMINI_API_KEY="AIzaSyYourActualKeyGoesHere"
```

### 3. Add Google Maps
Add your Google Maps API key to render real street view maps instead of visual simulations:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

---

## 🔒 Demo Credentials
To login immediately:
- **Client User**: Any email (e.g., `user@gmail.com`) + any password.
- **Administrator Panel**: `admin@coworkiq.com` + any password (unlocks the Admin Console).
