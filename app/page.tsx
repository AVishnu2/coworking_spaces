import Link from "next/link"
import { Button } from "../components/ui/button"
import { Sparkles, Wifi, ShieldCheck, MapPin, Search, Award, TrendingUp, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center py-8 sm:py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 dark:bg-blue-500/20 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold animate-pulse">
          <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
          <span>AI-Powered Smart Recommendations</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] pb-1">
          Find Coworking Spaces Based on{" "}
          <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Real Factors
          </span>
        </h1>
        
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stop guessing. Find your ideal desk with verified data on WiFi speeds, commute traffic, noise levels, washroom hygiene, and budget matches.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-bold shadow-lg cursor-pointer">
              <Search className="h-4 w-4 mr-2" />
              Explore Dashboard
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="glass" className="w-full sm:w-auto font-bold cursor-pointer">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-20">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col space-y-3 bg-card/45">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-primary flex items-center justify-center">
            <Wifi className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Blazing WiFi Speed</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WiFi accounts for 30% of our recommendation score. Filter workspaces supporting up to 300 Mbps download.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col space-y-3 bg-card/45">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">AI Review Summarizer</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uses Google Gemini API to analyze hundreds of reviews into structured pros, cons, and overall suitability indexes instantly.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-xl border border-border flex flex-col space-y-3 bg-card/45">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Accurate Score Breakdown</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Weighted matches on commute traffic, noise levels, washroom hygiene, cafeteria ratings, and parking requirements.
          </p>
        </div>
      </div>

      {/* Product Highlight / How it works */}
      <div className="w-full max-w-6xl mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Designed for Nomads, Freelancers, & Fast-Growing Teams
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            CoWorking Spaces bridges the gap between static reviews and your real-world needs. We gather verified specs to generate custom matching coefficients so you don't waste time on subpar desks.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Award className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Custom Weighted Formulas</h4>
                <p className="text-xs text-muted-foreground">Adjust priorities for budget, wifi, noise, and distance matching.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Interactive Side-by-Side Comparison</h4>
                <p className="text-xs text-muted-foreground">Select up to 3 spaces and compare specs like prices, traffic, and washroom ratings.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Visit Bookings & Fast Scheduler</h4>
                <p className="text-xs text-muted-foreground">Schedule visits in a few clicks to lock down available seats before you commute.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Mockup Frame */}
        <div className="glass-panel p-6 rounded-xl border border-border bg-card/35 relative overflow-hidden flex flex-col justify-between aspect-video">
          <div className="flex items-center space-x-2 border-b border-border/40 pb-3">
            <span className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-[10px] text-muted-foreground font-mono ml-4 truncate">coworkingspaces.com/recommendations</span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 pt-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Innov8 Premium Gachibowli</h4>
                <p className="text-[10px] text-muted-foreground">Gachibowli, Hyderabad</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">96</span>
                <span className="text-xs text-muted-foreground font-bold">/100</span>
              </div>
            </div>
            
            <div className="space-y-1.5 pl-2">
              <p className="text-xs text-foreground flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                Excellent WiFi speed (250 Mbps)
              </p>
              <p className="text-xs text-foreground flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                Within preferred daily budget (₹450/day)
              </p>
              <p className="text-xs text-foreground flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                Quiet noise zones available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
