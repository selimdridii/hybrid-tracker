"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMealsForDate,
  getWorkoutsForDate,
  getWeights,
  getTargets,
  computeStreak,
  today,
} from "@/lib/storage";
import type { MealEntry, WorkoutSession, WeightEntry, Targets } from "@/lib/types";
import RingProgress from "@/components/RingProgress";
import {
  Flame,
  Dumbbell,
  Utensils,
  Scale,
  TrendingUp,
  Zap,
  ChevronRight,
  Trophy,
} from "lucide-react";

const WORKOUT_LABELS: Record<string, { label: string; color: string }> = {
  push: { label: "Push", color: "#ff6b6b" },
  pull: { label: "Pull", color: "#ffa94d" },
  legs: { label: "Legs", color: "#74c0fc" },
  run: { label: "Run", color: "#a3ff47" },
  hyrox: { label: "Hyrox", color: "#da77f2" },
};

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-400">{label}</span>
        <span className="text-neutral-300">{value}g / {target}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const t = today();
    setMeals(getMealsForDate(t));
    setWorkouts(getWorkoutsForDate(t));
    setWeights(getWeights());
    setTargets(getTargets());
    setStreak(computeStreak());
  }, []);

  if (!targets) return null;

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  const latestWeight = weights[0];
  const prevWeight = weights[1];
  const weightDiff = latestWeight && prevWeight
    ? (latestWeight.weight - prevWeight.weight).toFixed(1)
    : null;

  const todayScore = (() => {
    let s = 0;
    if (totalCals >= targets.calories * 0.8 && totalCals <= targets.calories * 1.1) s += 40;
    if (totalProtein >= targets.protein * 0.9) s += 30;
    if (workouts.length > 0) s += 20;
    if (latestWeight?.date === today()) s += 10;
    return s;
  })();

  const scoreColor = todayScore >= 80 ? "#a3ff47" : todayScore >= 50 ? "#ffa94d" : "#ff6b6b";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Let&apos;s get after it</p>
        </div>
        <div className="flex items-center gap-2 bg-(--color-surface) border border-(--color-border) rounded-2xl px-4 py-2">
          <Flame size={18} className="text-orange-400" />
          <span className="font-bold text-lg">{streak}</span>
          <span className="text-neutral-500 text-sm">day streak</span>
        </div>
      </div>

      {/* Score + Nutrition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Today&apos;s Score</p>
              <p className="text-3xl font-bold mt-1" style={{ color: scoreColor }}>
                {todayScore}<span className="text-sm text-neutral-500 font-normal">/100</span>
              </p>
            </div>
            <Trophy size={32} style={{ color: scoreColor }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { ok: totalCals >= targets.calories * 0.8, label: "Calories" },
              { ok: totalProtein >= targets.protein * 0.9, label: "Protein" },
              { ok: workouts.length > 0, label: "Workout" },
            ].map(({ ok, label }) => (
              <div key={label} className="bg-neutral-800/50 rounded-xl p-2">
                <div className={`font-bold ${ok ? "text-(--color-accent)" : "text-neutral-600"}`}>{ok ? "✓" : "–"}</div>
                <div className="text-neutral-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Nutrition</p>
            <Link href="/meals" className="text-xs text-(--color-accent) flex items-center gap-0.5 hover:opacity-80">
              Log <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <RingProgress value={totalCals} max={targets.calories} size={80} color="#a3ff47" label={`${totalCals}`} sublabel="kcal" />
            <div className="flex-1 space-y-2">
              <MacroBar label="Protein" value={totalProtein} target={targets.protein} color="#74c0fc" />
              <MacroBar label="Carbs" value={totalCarbs} target={targets.carbs} color="#ffa94d" />
              <MacroBar label="Fat" value={totalFat} target={targets.fat} color="#ff6b6b" />
            </div>
          </div>
        </div>
      </div>

      {/* Workout + Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Today&apos;s Workout</p>
            <Link href="/workouts" className="text-xs text-(--color-accent) flex items-center gap-0.5 hover:opacity-80">Log <ChevronRight size={12} /></Link>
          </div>
          {workouts.length === 0 ? (
            <div className="text-center py-4">
              <Dumbbell size={28} className="text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">No workout logged yet</p>
              <Link href="/workouts" className="inline-block mt-3 text-xs bg-(--color-accent) text-black font-semibold px-3 py-1.5 rounded-lg hover:opacity-90">
                Log workout
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {workouts.map((w) => {
                const info = WORKOUT_LABELS[w.type];
                return (
                  <div key={w.id} className="flex items-center gap-3 bg-neutral-800/40 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: info.color + "22", color: info.color }}>{info.label}</span>
                    {w.type === "run" && <span className="text-sm text-neutral-300">{w.distance}km · {w.time}</span>}
                    {w.type === "hyrox" && <span className="text-sm text-neutral-300">{w.duration ? `${w.duration} min` : "Completed"}</span>}
                    {["push", "pull", "legs"].includes(w.type) && <span className="text-sm text-neutral-300">{w.exercises?.length ?? 0} exercises</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Body Weight</p>
            <Link href="/weight" className="text-xs text-(--color-accent) flex items-center gap-0.5 hover:opacity-80">Log <ChevronRight size={12} /></Link>
          </div>
          {!latestWeight ? (
            <div className="text-center py-4">
              <Scale size={28} className="text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">No weight logged yet</p>
              <Link href="/weight" className="inline-block mt-3 text-xs bg-(--color-accent) text-black font-semibold px-3 py-1.5 rounded-lg hover:opacity-90">Log weight</Link>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold">{latestWeight.weight}</span>
                <span className="text-neutral-500 mb-1">kg</span>
                {weightDiff !== null && (
                  <span className={`text-sm mb-1 flex items-center gap-0.5 ${parseFloat(weightDiff) <= 0 ? "text-(--color-accent)" : "text-red-400"}`}>
                    <TrendingUp size={14} />
                    {parseFloat(weightDiff) > 0 ? "+" : ""}{weightDiff}
                  </span>
                )}
              </div>
              <p className="text-neutral-600 text-xs">
                Last logged: {new Date(latestWeight.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
              {targets.weightGoal && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Goal: {targets.weightGoal}kg</span>
                    <span>{Math.abs(latestWeight.weight - targets.weightGoal).toFixed(1)}kg to go</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-(--color-accent) rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, 100 - ((latestWeight.weight - targets.weightGoal) / latestWeight.weight) * 100))}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Quick Log</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/meals", label: "Log Meal", icon: Utensils, color: "#ffa94d" },
            { href: "/workouts", label: "Log Workout", icon: Dumbbell, color: "#74c0fc" },
            { href: "/weight", label: "Log Weight", icon: Scale, color: "#a3ff47" },
            { href: "/workouts?type=hyrox", label: "Log Hyrox", icon: Zap, color: "#da77f2" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href} className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-neutral-600 transition-colors">
              <Icon size={22} style={{ color }} />
              <span className="text-xs text-neutral-400">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
