"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import type { AuthUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: (user: AuthUser) => void;
  defaultMode?: Mode;
}

export default function AuthDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  defaultMode = "login",
}: AuthDialogProps) {
  const { authenticate, startGoogleAuth } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email || !password || (mode === "register" && !name.trim())) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await authenticate(mode, { name, email, password });
      onAuthSuccess?.(user);
      setName("");
      setEmail("");
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[color:var(--border-soft)] bg-[color:var(--surface-1)] p-0">
        <div className="rounded-t-3xl border-b border-[color:var(--border-soft)] bg-[color:var(--surface-2)] px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-[color:var(--wave-teal)]" />
              Join GoWavy
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5">
          <div className="grid grid-cols-2 rounded-2xl bg-[color:var(--surface-2)] p-1.5">
            <Button
              variant={mode === "login" ? "default" : "ghost"}
              className="rounded-xl"
              onClick={() => setMode("login")}
            >
              Login
            </Button>
            <Button
              variant={mode === "register" ? "default" : "ghost"}
              className="rounded-xl"
              onClick={() => setMode("register")}
            >
              Register
            </Button>
          </div>

          <div className="space-y-3">
            {mode === "register" && (
              <Input
                className="rounded-xl"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
            <Input
              className="rounded-xl"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              className="rounded-xl"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <Button className="w-full rounded-xl" onClick={submit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Button>

          <div className="relative text-center text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            <span className="relative z-10 bg-[color:var(--surface-1)] px-2">or</span>
            <div className="absolute left-0 right-0 top-1/2 -z-0 h-px bg-[color:var(--border-soft)]" />
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={startGoogleAuth}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
