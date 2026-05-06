"use client";

import { useEffect, useState } from "react";
import { getWeights, saveWeight, deleteWeight, getTargets, saveTargets, today, generateId } from "@/lib/storage";
import type { WeightEntry, Targets } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Plus, Trash2, Settings, X, TrendingDown, TrendingUp, Minus } from "lucide-react";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-xs">
      <div className="text-neutral-500">{payload[0].payload.date}</div>
      <div className="font-bold text-white text-base">{payload[0].value} kg</div>
    </div>
  );
}

export default function WeightPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTargets, setShowTargets] = useState(false);
  const [inputWeight, setInputWeight] = useState("");
  const [inputDate, setInputDate] = useState(today());
  const [weightGoalInput, setWeightGoalInput] = useState("");

  useEffect(() => {
    async function load() {
      const [w, t] = await Promise.all([getWeights(), getTargets()]);
      setWeights(w);
      setTargets(t);
      setWeightGoalInput(String(t.weightGoal || ""));
    }
    load();
  }, []);

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.slice(-30).map((w) => ({ date: w.date.slice(5), weight: w.weight }));

  const latest = weights[0];
  const oldest30 = sorted[Math.max(0, sorted.length - 30)];
  const change30 = latest && oldest30 && latest.id !== oldest30.id
    ? (latest.weight - oldest30.weight).toFixed(1)
    : null;

  const avg = weights.length
    ? (weights.reduce((s, w) => s + w.weight, 0) / weights.length).toFixed(1)
    : null;

  async function handleAdd() {
    if (!inputWeight) return;
    const entry: WeightEntry = { id: generateId(), date: inputDate, weight: Number(inputWeight) };
    await saveWeight(entry);
    setWeights(await getWeights());
    setInputWeight("");
    setInputDate(today());
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await deleteWeight(id);
    setWeights(await getWeights());
  }

  async function handleSaveGoal() {
    if (!targets) return;
    const t = { ...targets, weightGoal: weightGoalInput ? Number(weightGoalInput) : undefined };
    await saveTargets(t);
    setTargets(t);
    setShowTargets(false);
  }

  if (!targets) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weight</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTargets(true)} className="p-2 rounded-xl border border-(--color-border) text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-(--color-accent) text-black font-semibold px-3 py-2 rounded-xl hover:opacity-90 text-sm">
            <Plus size={16} /> Log Weight
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold">{latest?.weight ?? "–"}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Current (kg)</div>
        </div>
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            {change30 !== null ? (
              <>
                {parseFloat(change30) < 0 ? <TrendingDown size={18} className="text-(--color-accent)" /> : parseFloat(change30) > 0 ? <TrendingUp size={18} className="text-red-400" /> : <Minus size={18} className="text-neutral-500" />}
                <span style={{ color: parseFloat(change30 || "0") <= 0 ? "#a3ff47" : "#ff6b6b" }}>
                  {parseFloat(change30) > 0 ? "+" : ""}{change30}
                </span>
              </>
            ) : "–"}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">30-day change</div>
        </div>
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold">{targets.weightGoal ?? "–"}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Goal (kg)</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">Trend (last 30 entries)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {targets.weightGoal && (
                <ReferenceLine y={targets.weightGoal} stroke="#a3ff4755" strokeDasharray="4 4" label={{ value: "Goal", fill: "#a3ff47", fontSize: 10 }} />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#a3ff47"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#a3ff47" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">History</p>
        {weights.length === 0 ? (
          <div className="text-center py-12 text-neutral-600">
            <p>No weight entries yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-(--color-accent) hover:opacity-80">+ Log your weight</button>
          </div>
        ) : (
          <div className="space-y-2">
            {weights.slice(0, 20).map((w, i) => {
              const prev = weights[i + 1];
              const diff = prev ? w.weight - prev.weight : null;
              return (
                <div key={w.id} className="bg-(--color-surface) border border-(--color-border) rounded-xl flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-bold">{w.weight} kg</span>
                    {diff !== null && (
                      <span className={`ml-2 text-xs ${diff < 0 ? "text-(--color-accent)" : diff > 0 ? "text-red-400" : "text-neutral-500"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    <button onClick={() => handleDelete(w.id)} className="text-neutral-700 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Weight Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Log Weight</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-neutral-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors"
                  placeholder="75.5"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showTargets && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Weight Goal</h2>
              <button onClick={() => setShowTargets(false)}><X size={18} className="text-neutral-500" /></button>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Target weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weightGoalInput}
                onChange={(e) => setWeightGoalInput(e.target.value)}
                className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors"
                placeholder="72.0"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowTargets(false)} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveGoal} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
