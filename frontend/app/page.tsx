"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Moon,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AuthDialog from "@/components/AuthDialog";
import { reverseGeocode } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const vibeOptions = [
  { label: "Chill", id: "chill", hint: "Calm evenings and easy cafés" },
  { label: "Party", id: "energy", hint: "Music, bars, and buzz" },
  { label: "Romantic", id: "cultural", hint: "Date-night friendly picks" },
  { label: "Adventure", id: "energy", hint: "Action-packed activities" },
  { label: "Food Trail", id: "gourmet", hint: "Food-first itineraries" },
  { label: "Healing", id: "chill", hint: "Slow and restorative plans" },
];

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser, signOut } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = localStorage.getItem("gowavy-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return storedTheme ? storedTheme === "dark" : prefersDark;
  });
  const [vibe, setVibe] = useState("chill");
  const [budget, setBudget] = useState("250");
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authHint, setAuthHint] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("gowavy-theme", next ? "dark" : "light");
      return next;
    });
  };

  const budgetSummary = useMemo(() => {
    const amount = Number(budget);
    if (Number.isNaN(amount)) return "Custom";
    if (amount <= 120) return "Budget friendly";
    if (amount <= 350) return "Balanced";
    if (amount <= 650) return "Premium";
    return "Luxury";
  }, [budget]);

  const detectLocation = async () => {
    if (!user) {
      setAuthHint("Login is required to detect your location and generate plans.");
      setAuthModalOpen(true);
      return;
    }

    setDetecting(true);
    setAuthHint(null);

    if (!("geolocation" in navigator)) {
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await reverseGeocode(latitude, longitude);
          if (data.city) {
            setLocation(`${data.city}${data.country ? `, ${data.country}` : ""}`);
          }
        } catch {
          setLocation("Detected location");
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startPlanning = () => {
    if (!user) {
      setAuthHint("Please login or register before starting your planner.");
      setAuthModalOpen(true);
      return;
    }

    router.push(`/planner?vibe=${vibe}&budget=${budget}&location=${encodeURIComponent(location)}`);
  };

  const onAuthSuccess = async () => {
    await refreshUser();
    setAuthHint(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[color:var(--wave-cream)] text-[color:var(--wave-ink)]">
      <AuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onAuthSuccess={onAuthSuccess}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0 opacity-65" />
        <div className="absolute left-[-10%] top-[-12%] h-[360px] w-[360px] rounded-full bg-[color:var(--wave-teal)]/20 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[color:var(--wave-red)]/14 blur-3xl" />
      </div>

      <header className="fixed top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-10">
        <div className="glass-panel mx-auto flex w-full max-w-[96rem] items-center justify-between rounded-3xl border border-[color:var(--border-soft)] px-4 py-3 sm:px-6 shadow-[0_30px_80px_-60px_var(--shadow-strong)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--wave-teal)]/20">
              <Sparkles className="h-5 w-5 text-[color:var(--wave-teal)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              GoWavy <span className="text-xs text-[color:var(--wave-teal)]">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {authLoading ? (
              <Badge className="hidden rounded-full md:inline-flex">Checking session...</Badge>
            ) : user ? (
              <Badge className="hidden rounded-full border-[color:var(--wave-teal)]/35 bg-[color:var(--wave-teal)]/15 text-[color:var(--wave-teal)] md:inline-flex">
                Signed in as {user.name.split(" ")[0]}
              </Badge>
            ) : (
              <Badge className="hidden rounded-full border-[color:var(--wave-red)]/35 bg-[color:var(--wave-red)]/12 text-[color:var(--wave-red)] md:inline-flex">
                Guest mode
              </Badge>
            )}

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <Button variant="outline" className="hidden sm:inline-flex" onClick={signOut}>
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => setAuthModalOpen(true)}
              >
                Login
              </Button>
            )}

            <Button variant="glow" onClick={startPlanning}>
              <span className="sm:hidden">Plan</span>
              <span className="hidden sm:inline">Start Planning</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mesh-gradient relative min-h-screen px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
        <section className="mx-auto max-w-5xl text-center">
          <Badge className="mb-5 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Secure planner with route intelligence
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Build a group hangout plan in
            <span className="bg-gradient-to-r from-[color:var(--wave-teal)] via-[color:var(--wave-blue)] to-[color:var(--wave-red)] bg-clip-text text-transparent">
              {" "}minutes
            </span>
            , not hours.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[color:var(--text-muted)] sm:text-lg">
            Choose your vibe, budget, and destination. GoWavy suggests places, orders stops,
            and prepares a route-ready outing for your whole crew.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="glow" size="lg" className="w-full max-w-xs sm:w-auto" onClick={startPlanning}>
              Create My Plan
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full max-w-xs sm:w-auto"
              onClick={detectLocation}
              disabled={detecting}
            >
              {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              Auto-detect location
            </Button>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <Card className="glass-card rounded-2xl border-[color:var(--border-soft)] p-4">
              <p className="text-2xl font-black">3 taps</p>
              <p className="text-xs text-[color:var(--text-muted)]">to generate your first route</p>
            </Card>
            <Card className="glass-card rounded-2xl border-[color:var(--border-soft)] p-4">
              <p className="text-2xl font-black">Map-ready</p>
              <p className="text-xs text-[color:var(--text-muted)]">ordered stops and route legs</p>
            </Card>
            <Card className="glass-card rounded-2xl border-[color:var(--border-soft)] p-4">
              <p className="text-2xl font-black">Team-first</p>
              <p className="text-xs text-[color:var(--text-muted)]">budget and crew-aware planning</p>
            </Card>
          </div>
        </section>

        <section className="mx-auto mt-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="glass-panel overflow-hidden rounded-[2.4rem] border-[color:var(--border-soft)] p-0 shadow-[0_50px_140px_-110px_var(--shadow-strong)]">
            <CardContent className="space-y-8 p-7 sm:p-9 md:p-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Choose your vibe
                </label>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {vibeOptions.map((option) => (
                    <Button
                      key={`${option.label}-${option.id}`}
                      variant="outline"
                      onClick={() => setVibe(option.id)}
                      className={`h-auto flex-col items-start gap-1.5 rounded-2xl px-4 py-4 text-left ${
                        vibe === option.id
                          ? "border-[color:var(--wave-teal)] bg-[color:var(--surface-3)] shadow-[0_15px_40px_-34px_var(--glow)]"
                          : ""
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{option.label}</span>
                      <span className="text-[11px] text-[color:var(--text-muted)]">{option.hint}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    Budget
                  </label>
                  <span className="text-sm font-bold text-[color:var(--wave-teal)]">
                    ${budget} ({budgetSummary})
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[color:var(--border-soft)] accent-[color:var(--wave-teal)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                  <Input
                    placeholder="Enter city or area"
                    className="rounded-2xl pl-10 pr-24"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-xl px-3 text-[10px] font-bold"
                    onClick={detectLocation}
                    disabled={detecting}
                  >
                    {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Auto"}
                  </Button>
                </div>
              </div>

              {authHint && (
                <div className="rounded-xl border border-[color:var(--wave-red)]/30 bg-[color:var(--wave-red)]/10 px-4 py-3 text-sm font-medium text-[color:var(--wave-red)]">
                  {authHint}
                </div>
              )}

              <Button
                variant="glow"
                size="lg"
                className="w-full rounded-2xl text-base sm:text-lg"
                onClick={startPlanning}
              >
                Continue to Planner
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <WandSparkles className="h-5 w-5 text-[color:var(--wave-teal)]" />
                <h3 className="text-base font-bold">How it works</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  <strong className="mr-1">1.</strong>Select mood, budget, and location.
                </p>
                <p className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  <strong className="mr-1">2.</strong>AI builds a stop-by-stop outing.
                </p>
                <p className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  <strong className="mr-1">3.</strong>Open maps, follow route, and go.
                </p>
              </div>
            </Card>

            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <Route className="h-5 w-5 text-[color:var(--wave-teal)]" />
                <h3 className="text-base font-bold">What you get</h3>
              </div>
              <p className="text-sm text-[color:var(--text-muted)]">
                Validated spots, estimated cost per person, time blocks, and route summaries
                designed for real-time decision making with friends.
              </p>
            </Card>

            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-6">
              <h3 className="text-base font-bold">Friendly by design</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Mobile-first controls, instant auth prompts, and smart defaults keep planning
                smooth even when your group is already on the move.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
