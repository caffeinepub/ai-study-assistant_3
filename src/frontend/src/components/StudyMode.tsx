import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, BookOpen, Trophy, X, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSaveStudySession, useGetStudyHistory } from "../hooks/useQueries";

type TimerState = "idle" | "running" | "paused" | "completed";

const MOTIVATIONAL_MESSAGES = [
  "Stay focused! You're doing great!",
  "Every minute of focus builds your future.",
  "Champions are made in moments like these.",
  "Your future self will thank you.",
  "Deep work creates extraordinary results.",
  "Focus now, succeed later.",
  "You are building a better you!",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function CircularProgress({ progress, size = 220, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]" role="img" aria-label="Timer progress">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/40"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-1000"
        style={{ filter: "drop-shadow(0 0 6px oklch(var(--primary)))" }}
      />
    </svg>
  );
}

export default function StudyMode() {
  const [durationInput, setDurationInput] = useState("25");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [showFocusLock, setShowFocusLock] = useState(false);
  const [motivationIdx, setMotivationIdx] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveSession = useSaveStudySession();
  const { data: studyHistory } = useGetStudyHistory();

  const totalStudyMinutes = studyHistory
    ? studyHistory.reduce((acc, s) => acc + (s.completed ? Number(s.durationMinutes) : 0), 0)
    : 0;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Rotate motivational message every 15s during focus
  useEffect(() => {
    if (timerState !== "running") return;
    const id = setInterval(() => {
      setMotivationIdx((i) => (i + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 15000);
    return () => clearInterval(id);
  }, [timerState]);

  const handleStart = () => {
    const mins = parseInt(durationInput, 10);
    if (isNaN(mins) || mins < 1 || mins > 180) {
      toast.error("Please enter a duration between 1 and 180 minutes.");
      return;
    }

    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setTimerState("running");
    setShowFocusLock(true);
    setStartTime(new Date());

    // Try to enter fullscreen
    try {
      document.documentElement.requestFullscreen?.();
    } catch {
      // Fullscreen not available, continue anyway
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setTimerState("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResume = () => {
    if (remainingSeconds <= 0) return;
    setTimerState("running");

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setTimerState("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    clearTimer();
    setTimerState("paused");
  };

  const handleReset = () => {
    clearTimer();
    setTimerState("idle");
    setShowFocusLock(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setShowExitConfirm(false);
    try {
      document.exitFullscreen?.();
    } catch {
      // ignore
    }
  };

  const handleExitFocusMode = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    // Save incomplete session
    if (startTime) {
      const endTime = new Date();
      const elapsedMinutes = BigInt(Math.max(1, Math.floor((endTime.getTime() - startTime.getTime()) / 60000)));
      saveSession.mutate({
        startTime: BigInt(startTime.getTime()) * 1_000_000n,
        endTime: BigInt(endTime.getTime()) * 1_000_000n,
        durationMinutes: elapsedMinutes,
        completed: false,
      });
    }
    handleReset();
  };

  // Save completed session
  const saveSessionRef = useRef(saveSession.mutate);
  useEffect(() => { saveSessionRef.current = saveSession.mutate; });

  useEffect(() => {
    if (timerState === "completed" && startTime) {
      const endTime = new Date();
      const mins = parseInt(durationInput, 10);
      saveSessionRef.current({
        startTime: BigInt(startTime.getTime()) * 1_000_000n,
        endTime: BigInt(endTime.getTime()) * 1_000_000n,
        durationMinutes: BigInt(mins),
        completed: true,
      });
      try {
        document.exitFullscreen?.();
      } catch {
        // ignore
      }
    }
  }, [timerState, startTime, durationInput]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  // ── Focus Lock Screen ──────────────────────────────────────────────────────
  if (showFocusLock) {
    if (timerState === "completed") {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <div className="text-center space-y-6 px-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">Session Complete!</h1>
            <p className="text-muted-foreground font-body text-lg">
              You focused for <span className="text-primary font-semibold">{durationInput} minutes</span>. Excellent work!
            </p>
            <div className="bg-card border border-border/60 rounded-2xl p-4 text-sm text-muted-foreground font-body">
              Total focused time: <span className="text-accent font-semibold">{totalStudyMinutes + parseInt(durationInput || "0", 10)} min</span>
            </div>
            <Button
              className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
              onClick={handleReset}
            >
              Done
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/98 backdrop-blur-sm">
        {/* Exit confirmation dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 space-y-4">
              <h3 className="font-display font-semibold text-foreground text-lg">Exit Study Mode?</h3>
              <p className="text-muted-foreground font-body text-sm">
                Your session will be marked as incomplete. Stay focused and finish strong!
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border/60"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Stay Focused
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmExit}
                >
                  Exit
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-8 px-6 w-full max-w-sm">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Flame className="w-5 h-5" />
              <span className="font-display font-semibold text-sm uppercase tracking-widest">Focus Mode Active</span>
            </div>
          </div>

          {/* Timer Ring */}
          <div className="relative flex items-center justify-center">
            <CircularProgress progress={progress} size={220} strokeWidth={12} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-bold text-foreground tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs text-muted-foreground font-body mt-1">
                {Math.ceil(remainingSeconds / 60)} min left
              </span>
            </div>
          </div>

          {/* Motivational message */}
          <p className="text-muted-foreground font-body text-sm italic px-4 min-h-[40px] transition-all duration-500">
            "{MOTIVATIONAL_MESSAGES[motivationIdx]}"
          </p>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {timerState === "running" ? (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-border/60 hover:border-primary/60 gap-2"
                onClick={handlePause}
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={handleResume}
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
            )}
          </div>

          {/* Exit button */}
          <button
            type="button"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 font-body transition-colors"
            onClick={handleExitFocusMode}
          >
            Exit Study Mode
          </button>
        </div>
      </div>
    );
  }

  // ── Setup Screen ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 max-w-md mx-auto w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">Study Mode</h2>
          <p className="text-muted-foreground font-body text-sm">
            Set a timer and enter distraction-free focus mode
          </p>
        </div>

        {/* Timer Setup Card */}
        <div className="w-full bg-card border border-border/60 rounded-2xl p-6 space-y-5 shadow-card-raised">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-body" htmlFor="duration-input">
              Session Duration (minutes)
            </label>
            <Input
              id="duration-input"
              type="number"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              min={1}
              max={180}
              placeholder="e.g. 25"
              className="text-center text-2xl font-display font-bold h-14 bg-secondary/40 border-border/60 focus:border-primary/60"
            />
          </div>

          {/* Quick select buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationInput(String(mins))}
                className={`py-2 rounded-xl text-sm font-medium font-body transition-colors border
                  ${durationInput === String(mins)
                    ? "bg-primary/20 border-primary/60 text-primary"
                    : "bg-secondary/40 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-12 rounded-xl gap-2 shadow-glow-cyan"
            onClick={handleStart}
          >
            <Play className="w-4 h-4" />
            Start Focus Session
          </Button>
        </div>

        {/* Tips */}
        <div className="w-full bg-secondary/30 border border-border/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium font-body uppercase tracking-wide">Study Tips</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground font-body">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>The Pomodoro method: 25 min focus + 5 min break</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Put your phone face-down during sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Drink water and prepare your notes before starting</span>
            </li>
          </ul>
        </div>

        {/* Stats */}
        {totalStudyMinutes > 0 && (
          <div className="w-full bg-card border border-border/60 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-body">Total focused time</span>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="font-display font-bold text-accent">{totalStudyMinutes} min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
