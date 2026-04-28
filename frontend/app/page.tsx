"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Moon, Play, Sparkles, Sun, User, Loader2 } from "lucide-react";

const vibeOptions = [
  { label: "Chill", emoji: "🧊", id: "chill" },
  { label: "Party", emoji: "🥳", id: "energy" },
  { label: "Romantic", emoji: "❤️", id: "cultural" },
  { label: "Adventure", emoji: "🏔️", id: "energy" },
  { label: "Healing", emoji: "🧘", id: "chill" },
];

export default function Home() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [vibe, setVibe] = useState("chill");
  const [budget, setBudget] = useState("250");
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("gowavy-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = storedTheme ? storedTheme === "dark" : prefersDark;

    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("gowavy-theme", next ? "dark" : "light");
      return next;
    });
  };

  const detectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch("http://localhost:5000/api/trip/geocode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
            const data = await res.json();
            if (data.city) setLocation(data.city); // This will now often be Neighborhood, City
          } catch (err) {
            setLocation("Detected Location");
          } finally {
            setDetecting(false);
          }
        },
        () => setDetecting(false),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setDetecting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[color:var(--wave-cream)] text-[color:var(--wave-ink)]">
      <header className="fixed top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-10">
        <div className="glass-panel mx-auto flex w-full max-w-[96rem] items-center justify-between rounded-2xl border border-[color:var(--border-soft)] px-4 py-3 sm:px-6 shadow-[0_30px_80px_-60px_var(--shadow-strong)]">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--wave-teal)]/20">
              <Sparkles className="h-5 w-5 text-[color:var(--wave-teal)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              GoWavy <span className="text-[color:var(--wave-teal)] text-xs">AI</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--text-muted)] md:flex">
            <a className="transition hover:text-[color:var(--wave-ink)]" href="/planner">Planner</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="glow"
              onClick={() => router.push("/planner")}
            >
              Start Planning
            </Button>
          </div>
        </div>
      </header>

      <main className="mesh-gradient min-h-screen px-6 pb-20 pt-32">
        <section className="mx-auto mb-12 max-w-4xl text-center">
          <Badge className="mb-6 rounded-full">
            <Sparkles className="h-3 w-3" />
            The Future of Hanging Out
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Plan the perfect hangout or trip — powered by{" "}
            <span className="bg-gradient-to-r from-[color:var(--wave-teal)] via-[color:var(--wave-blue)] to-[color:var(--wave-red)] bg-clip-text text-transparent">
              AI
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--text-muted)]">
            Skip the endless group chats. Tell us your vibe, and let our
            wave-checked AI craft your next unforgettable memory in seconds.
          </p>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <Card className="glass-panel relative overflow-hidden rounded-[2.5rem] border-[color:var(--border-soft)] p-0 shadow-[0_50px_140px_-110px_var(--shadow-strong)]">
            <CardContent className="relative p-8 md:p-10">
              <div className="grid gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                      Choose Your Vibe
                    </label>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {vibeOptions.map((v) => (
                        <Button
                          key={v.label}
                          variant="outline"
                          onClick={() => setVibe(v.id)}
                          className={`h-auto flex-col gap-2 rounded-2xl px-2 py-4 ${
                            vibe === v.id ? "bg-[color:var(--surface-3)] border-[color:var(--wave-teal)]" : ""
                          }`}
                        >
                          <span className="text-2xl">{v.emoji}</span>
                          <span className="text-[10px] font-bold">{v.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                        Budget Range
                      </label>
                      <span className="text-sm font-bold text-[color:var(--wave-teal)]">
                        ${budget}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[color:var(--border-soft)] accent-[color:var(--wave-teal)]"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                      Where to?
                    </label>
                    <div className="relative mt-4">
                      <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <Input
                        placeholder="Enter city or 'Near Me'"
                        className="pl-10 pr-20"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="absolute right-2 top-1/2 h-8 -translate-y-1/2 px-3 text-[10px] font-bold"
                        onClick={detectLocation}
                        disabled={detecting}
                      >
                        {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Auto"}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => router.push(`/planner?vibe=${vibe}&budget=${budget}&location=${location}`)}
                  >
                    Go to Planner
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
