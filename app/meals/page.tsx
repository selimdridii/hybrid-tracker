"use client";

import { useEffect, useState } from "react";
import { getMeals, saveMeal, deleteMeal, getTargets, saveTargets, today, generateId } from "@/lib/storage";
import type { MealEntry, Targets } from "@/lib/types";
import { MEAL_PRESETS } from "@/lib/types";
import { Plus, Trash2, Settings, X, ChevronDown, ChevronUp, Zap, Sparkles, Loader2 } from "lucide-react";
import RingProgress from "@/components/RingProgress";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_COLORS: Record<string, string> = {
  breakfast: "#ffa94d",
  lunch: "#74c0fc",
  dinner: "#ff6b6b",
  snack: "#a3ff47",
};

function empty(): { name: string; description: string; calories: string; protein: string; carbs: string; fat: string; mealType: MealEntry["mealType"] } {
  return { name: "", description: "", calories: "", protein: "", carbs: "", fat: "", mealType: "breakfast" };
}

export default function MealsPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTargets, setShowTargets] = useState(false);
  const [form, setForm] = useState(empty());
  const [targetForm, setTargetForm] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [selectedDate, setSelectedDate] = useState(today());
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    setMeals(getMeals());
    const t = getTargets();
    setTargets(t);
    setTargetForm({ calories: String(t.calories), protein: String(t.protein), carbs: String(t.carbs), fat: String(t.fat) });
  }, []);

  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const totals = dayMeals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  function handleAdd() {
    if (!form.name && !form.description) return;
    const meal: MealEntry = {
      id: generateId(),
      date: selectedDate,
      mealType: form.mealType,
      name: form.name || form.description,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };
    saveMeal(meal);
    setMeals(getMeals());
    setForm(empty());
    setShowForm(false);
  }

  function handleDelete(id: string) {
    deleteMeal(id);
    setMeals(getMeals());
  }

  function handleQuickAdd(preset: typeof MEAL_PRESETS[number]) {
    const meal: MealEntry = {
      id: generateId(),
      date: selectedDate,
      mealType: preset.mealType,
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
    };
    saveMeal(meal);
    setMeals(getMeals());
  }

  async function handleCalculateMacros() {
    if (!form.description.trim()) return;
    setCalculating(true);
    try {
      const res = await fetch("/api/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });
      if (res.ok) {
        const macros = await res.json();
        setForm((f) => ({
          ...f,
          calories: macros.calories ? String(macros.calories) : f.calories,
          protein: macros.protein ? String(macros.protein) : f.protein,
          carbs: macros.carbs ? String(macros.carbs) : f.carbs,
          fat: macros.fat ? String(macros.fat) : f.fat,
          name: f.name || f.description,
        }));
      }
    } finally {
      setCalculating(false);
    }
  }

  function handleSaveTargets() {
    if (!targets) return;
    const t: Targets = {
      ...targets,
      calories: Number(targetForm.calories),
      protein: Number(targetForm.protein),
      carbs: Number(targetForm.carbs),
      fat: Number(targetForm.fat),
    };
    saveTargets(t);
    setTargets(t);
    setShowTargets(false);
  }

  const grouped = MEAL_TYPES.map((type) => ({
    type,
    items: dayMeals.filter((m) => m.mealType === type),
  })).filter((g) => g.items.length > 0 || showForm);

  if (!targets) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meals</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 text-sm text-neutral-500 bg-transparent border-none outline-none cursor-pointer"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTargets(true)} className="p-2 rounded-xl border border-(--color-border) text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-(--color-accent) text-black font-semibold px-3 py-2 rounded-xl hover:opacity-90 text-sm">
            <Plus size={16} /> Add Meal
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
        <div className="flex items-center gap-6">
          <RingProgress value={totals.calories} max={targets.calories} size={72} color="#a3ff47" label={`${totals.calories}`} sublabel="kcal" />
          <div className="flex-1 grid grid-cols-3 gap-4">
            {[
              { label: "Protein", value: totals.protein, target: targets.protein, color: "#74c0fc" },
              { label: "Carbs", value: totals.carbs, target: targets.carbs, color: "#ffa94d" },
              { label: "Fat", value: totals.fat, target: targets.fat, color: "#ff6b6b" },
            ].map(({ label, value, target, color }) => (
              <div key={label}>
                <div className="text-xs text-neutral-500 mb-1">{label}</div>
                <div className="text-lg font-bold" style={{ color }}>{value}g</div>
                <div className="text-xs text-neutral-600">/ {target}g</div>
                <div className="h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / target) * 100)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add from Plan */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-(--color-accent)" />
          <p className="text-xs text-neutral-500 uppercase tracking-wider">My Meal Plan</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MEAL_PRESETS.map((preset) => {
            const color = MEAL_COLORS[preset.mealType];
            const alreadyLogged = dayMeals.some((m) => m.name === preset.name);
            return (
              <button
                key={preset.name}
                onClick={() => !alreadyLogged && handleQuickAdd(preset)}
                disabled={alreadyLogged}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left border transition-colors ${
                  alreadyLogged
                    ? "border-(--color-border) opacity-40 cursor-default"
                    : "border-(--color-border) hover:border-neutral-600 bg-(--color-surface)"
                }`}
              >
                <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {preset.name}
                    {alreadyLogged && <span className="text-xs text-(--color-accent) font-normal">✓ logged</span>}
                  </div>
                  <div className="text-xs text-neutral-600 truncate">{preset.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-neutral-300">{preset.calories} kcal</div>
                  <div className="text-xs text-neutral-600">{preset.protein}g P</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals list */}
      <div className="space-y-4">
        {MEAL_TYPES.map((type) => {
          const items = dayMeals.filter((m) => m.mealType === type);
          if (items.length === 0) return null;
          const color = MEAL_COLORS[type];
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{type}</span>
                <div className="flex-1 h-px bg-(--color-border)" />
                <span className="text-xs text-neutral-600">{items.reduce((s, m) => s + m.calories, 0)} kcal</span>
              </div>
              <div className="space-y-2">
                {items.map((meal) => (
                  <div key={meal.id} className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-medium">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{meal.calories} kcal</span>
                        {expandedMeal === meal.id ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
                      </div>
                    </button>
                    {expandedMeal === meal.id && (
                      <div className="px-4 pb-3 border-t border-(--color-border)">
                        <div className="grid grid-cols-3 gap-3 mt-3 text-center text-xs">
                          <div className="bg-neutral-800/50 rounded-lg p-2">
                            <div className="font-bold text-blue-400">{meal.protein}g</div>
                            <div className="text-neutral-500">Protein</div>
                          </div>
                          <div className="bg-neutral-800/50 rounded-lg p-2">
                            <div className="font-bold text-orange-400">{meal.carbs}g</div>
                            <div className="text-neutral-500">Carbs</div>
                          </div>
                          <div className="bg-neutral-800/50 rounded-lg p-2">
                            <div className="font-bold text-red-400">{meal.fat}g</div>
                            <div className="text-neutral-500">Fat</div>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(meal.id)} className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {dayMeals.length === 0 && (
          <div className="text-center py-12 text-neutral-600">
            <p>No meals logged for this day.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-(--color-accent) hover:opacity-80">+ Add your first meal</button>
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Add Meal</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-neutral-500" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, mealType: t })}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                      form.mealType === t
                        ? "text-black font-bold"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                    style={form.mealType === t ? { background: MEAL_COLORS[t], color: "black" } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors"
                placeholder="Meal name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="relative">
                <textarea
                  className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors resize-none pr-10"
                  placeholder="Describe the meal (e.g. 2 eggs, sourdough toast, butter)…"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <button
                  onClick={handleCalculateMacros}
                  disabled={calculating || !form.description.trim()}
                  title="Calculate macros with AI"
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-(--color-accent) text-black disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {calculating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "calories", label: "Calories (kcal)" },
                  { key: "protein", label: "Protein (g)" },
                  { key: "carbs", label: "Carbs (g)" },
                  { key: "fat", label: "Fat (g)" },
                ].map(({ key, label }) => (
                  <input
                    key={key}
                    type="number"
                    className="bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors"
                    placeholder={label}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ))}
              </div>
              {calculating && (
                <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <Loader2 size={10} className="animate-spin" /> Estimating macros…
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name && !form.description} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Targets Modal */}
      {showTargets && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Daily Targets</h2>
              <button onClick={() => setShowTargets(false)}><X size={18} className="text-neutral-500" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "calories", label: "Calories (kcal)" },
                { key: "protein", label: "Protein (g)" },
                { key: "carbs", label: "Carbs (g)" },
                { key: "fat", label: "Fat (g)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
                  <input
                    type="number"
                    className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors"
                    value={targetForm[key as keyof typeof targetForm]}
                    onChange={(e) => setTargetForm({ ...targetForm, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowTargets(false)} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveTargets} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
