"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getWorkouts, saveWorkout, deleteWorkout, today, generateId } from "@/lib/storage";
import type { WorkoutSession, WorkoutType, Exercise, HyroxStation } from "@/lib/types";
import { HYROX_STATIONS, WORKOUT_EXERCISES } from "@/lib/types";
import { Plus, Trash2, X, ChevronDown, ChevronUp, Check, Timer, Dumbbell, Wind, Zap } from "lucide-react";

const TYPE_CONFIG: Record<WorkoutType, { label: string; color: string; icon: React.ReactNode }> = {
  push: { label: "Push", color: "#ff6b6b", icon: <Dumbbell size={16} /> },
  pull: { label: "Pull", color: "#ffa94d", icon: <Dumbbell size={16} /> },
  legs: { label: "Legs", color: "#74c0fc", icon: <Dumbbell size={16} /> },
  run: { label: "Run", color: "#a3ff47", icon: <Wind size={16} /> },
  hyrox: { label: "Hyrox", color: "#da77f2", icon: <Zap size={16} /> },
};

function WorkoutCard({ workout, onDelete }: { workout: WorkoutSession; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[workout.type];

  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/20 transition-colors"
      >
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.color + "22", color: cfg.color }}>
          {cfg.icon}
        </span>
        <div className="flex-1 text-left">
          <div className="font-semibold text-sm">{cfg.label}</div>
          <div className="text-xs text-neutral-500">
            {workout.date} {workout.duration ? `· ${workout.duration} min` : ""}
            {workout.type === "run" && workout.distance ? ` · ${workout.distance}km` : ""}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-(--color-border) pt-3 space-y-3">
          {workout.type === "run" && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-neutral-800/50 rounded-xl p-2"><div className="font-bold text-(--color-accent)">{workout.distance}km</div><div className="text-neutral-500">Distance</div></div>
              <div className="bg-neutral-800/50 rounded-xl p-2"><div className="font-bold text-(--color-accent)">{workout.time}</div><div className="text-neutral-500">Time</div></div>
              <div className="bg-neutral-800/50 rounded-xl p-2"><div className="font-bold text-(--color-accent)">{workout.pace}</div><div className="text-neutral-500">Pace</div></div>
            </div>
          )}
          {workout.type === "hyrox" && workout.stations && (
            <div className="space-y-1.5">
              {workout.stations.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${s.completed ? "bg-(--color-accent) text-black" : "bg-neutral-800 text-neutral-600"}`}>
                      {s.completed ? <Check size={10} /> : i + 1}
                    </div>
                    <span className={s.completed ? "text-white" : "text-neutral-500"}>{s.name}</span>
                  </div>
                  <span className="text-neutral-500">{s.result || s.target}</span>
                </div>
              ))}
            </div>
          )}
          {["push", "pull", "legs"].includes(workout.type) && workout.exercises && (
            <div className="space-y-2">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="text-xs">
                  <div className="font-medium text-neutral-300 mb-1">{ex.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {ex.sets.map((set, j) => (
                      <span key={j} className="bg-neutral-800 rounded-lg px-2 py-1 text-neutral-400">
                        {set.reps}×{set.weight}kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {workout.notes && <p className="text-xs text-neutral-500 italic">{workout.notes}</p>}
          <button onClick={onDelete} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
            <Trash2 size={12} /> Delete workout
          </button>
        </div>
      )}
    </div>
  );
}

function StrengthForm({ type, onSave, onCancel }: { type: "push" | "pull" | "legs"; onSave: (session: WorkoutSession) => void; onCancel: () => void }) {
  const exercises = WORKOUT_EXERCISES[type];
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  function toggleExercise(name: string) {
    if (selected.find((e) => e.name === name)) {
      setSelected(selected.filter((e) => e.name !== name));
    } else {
      setSelected([...selected, { name, sets: [{ reps: 0, weight: 0 }] }]);
    }
  }

  function addSet(exName: string) {
    setSelected(selected.map((e) => e.name === exName ? { ...e, sets: [...e.sets, { reps: 0, weight: 0 }] } : e));
  }

  function updateSet(exName: string, setIdx: number, field: "reps" | "weight", value: number) {
    setSelected(selected.map((e) => e.name === exName ? {
      ...e,
      sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s),
    } : e));
  }

  function removeSet(exName: string, setIdx: number) {
    setSelected(selected.map((e) => e.name === exName ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx) } : e).filter((e) => e.sets.length > 0));
  }

  function handleSave() {
    const session: WorkoutSession = {
      id: generateId(),
      date: today(),
      type,
      exercises: selected,
      duration: duration ? Number(duration) : undefined,
      notes: notes || undefined,
    };
    onSave(session);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 uppercase tracking-wider">Select Exercises</p>
      <div className="grid grid-cols-2 gap-2">
        {exercises.map((ex) => {
          const isSelected = !!selected.find((e) => e.name === ex);
          return (
            <button
              key={ex}
              onClick={() => toggleExercise(ex)}
              className={`text-left text-sm px-3 py-2 rounded-xl border transition-colors ${
                isSelected ? "border-(--color-accent) text-(--color-accent) bg-(--color-accent)/10" : "border-(--color-border) text-neutral-400 hover:text-white"
              }`}
            >
              {ex}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Log Sets</p>
          {selected.map((ex) => (
            <div key={ex.name} className="bg-neutral-800/40 rounded-xl p-3">
              <div className="font-medium text-sm mb-2">{ex.name}</div>
              <div className="space-y-2">
                {ex.sets.map((set, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 w-5">S{i + 1}</span>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(ex.name, i, "reps", Number(e.target.value))}
                      className="flex-1 bg-(--color-surface-2) border border-(--color-border-2) rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors text-center"
                    />
                    <input
                      type="number"
                      placeholder="kg"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(ex.name, i, "weight", Number(e.target.value))}
                      className="flex-1 bg-(--color-surface-2) border border-(--color-border-2) rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors text-center"
                    />
                    <button onClick={() => removeSet(ex.name, i)} className="text-neutral-600 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSet(ex.name)} className="mt-2 text-xs text-neutral-500 hover:text-(--color-accent) flex items-center gap-1">
                <Plus size={12} /> Add set
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Duration (min)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors" placeholder="60" />
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors resize-none"
      />

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={selected.length === 0} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90 disabled:opacity-40">Save Workout</button>
      </div>
    </div>
  );
}

function RunForm({ onSave, onCancel }: { onSave: (s: WorkoutSession) => void; onCancel: () => void }) {
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [notes, setNotes] = useState("");

  const totalSeconds = (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
  const paceSeconds = distance ? Math.round(totalSeconds / Number(distance)) : 0;
  const paceMin = Math.floor(paceSeconds / 60);
  const paceSec = paceSeconds % 60;
  const paceStr = distance && totalSeconds ? `${paceMin}:${String(paceSec).padStart(2, "0")}/km` : "–";
  const timeStr = `${String(Number(hours) || 0).padStart(2, "0")}:${String(Number(minutes) || 0).padStart(2, "0")}:${String(Number(seconds) || 0).padStart(2, "0")}`;

  function handleSave() {
    const session: WorkoutSession = {
      id: generateId(),
      date: today(),
      type: "run",
      distance: Number(distance),
      time: timeStr,
      pace: paceStr,
      notes: notes || undefined,
    };
    onSave(session);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-neutral-500 mb-1 block">Distance (km) *</label>
        <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors" placeholder="10.0" />
      </div>
      <div>
        <label className="text-xs text-neutral-500 mb-1 block">Time</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: hours, set: setHours, label: "HH" },
            { val: minutes, set: setMinutes, label: "MM" },
            { val: seconds, set: setSeconds, label: "SS" },
          ].map(({ val, set, label }) => (
            <input key={label} type="number" value={val} onChange={(e) => set(e.target.value)} className="bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-(--color-accent) transition-colors" placeholder={label} />
          ))}
        </div>
      </div>
      {distance && totalSeconds > 0 && (
        <div className="flex items-center gap-2 bg-neutral-800/40 rounded-xl px-4 py-3">
          <Timer size={16} className="text-(--color-accent)" />
          <span className="text-sm">Pace: <strong className="text-(--color-accent)">{paceStr}</strong></span>
        </div>
      )}
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors resize-none" />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!distance} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90 disabled:opacity-40">Save Run</button>
      </div>
    </div>
  );
}

function HyroxForm({ onSave, onCancel }: { onSave: (s: WorkoutSession) => void; onCancel: () => void }) {
  const [stations, setStations] = useState<HyroxStation[]>(HYROX_STATIONS.map((s) => ({ ...s })));
  const [totalTime, setTotalTime] = useState("");
  const [notes, setNotes] = useState("");

  function toggleStation(i: number) {
    setStations(stations.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s));
  }

  function updateResult(i: number, result: string) {
    setStations(stations.map((s, idx) => idx === i ? { ...s, result } : s));
  }

  const completedCount = stations.filter((s) => s.completed).length;

  function handleSave() {
    const session: WorkoutSession = {
      id: generateId(),
      date: today(),
      type: "hyrox",
      stations,
      duration: totalTime ? Number(totalTime) : undefined,
      notes: notes || undefined,
    };
    onSave(session);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">Stations</p>
        <span className="text-xs text-neutral-500">{completedCount}/8 done</span>
      </div>
      <div className="space-y-2">
        {stations.map((station, i) => (
          <div key={i} className="flex items-center gap-3 bg-neutral-800/40 rounded-xl px-3 py-2.5">
            <button
              onClick={() => toggleStation(i)}
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                station.completed ? "bg-(--color-accent) text-black" : "bg-neutral-700 text-neutral-500"
              }`}
            >
              {station.completed ? <Check size={12} /> : <span className="text-xs">{i + 1}</span>}
            </button>
            <div className="flex-1">
              <div className="text-sm font-medium">{station.name}</div>
              <div className="text-xs text-neutral-500">{station.target}</div>
            </div>
            {station.completed && (
              <input
                type="text"
                placeholder="Result"
                value={station.result || ""}
                onChange={(e) => updateResult(i, e.target.value)}
                className="w-24 bg-(--color-surface-2) border border-(--color-border-2) rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-(--color-accent) transition-colors"
              />
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs text-neutral-500 mb-1 block">Total time (min)</label>
        <input type="number" value={totalTime} onChange={(e) => setTotalTime(e.target.value)} className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent) transition-colors" placeholder="65" />
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-(--color-surface-2) border border-(--color-border-2) rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-(--color-accent) transition-colors resize-none" />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-black font-bold text-sm hover:opacity-90">Save Hyrox</button>
      </div>
    </div>
  );
}

function WorkoutsContent() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("type") as WorkoutType | null;

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [showForm, setShowForm] = useState(!!preselect);
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(preselect);
  const [filterDate, setFilterDate] = useState(today());

  useEffect(() => {
    getWorkouts().then(setWorkouts);
  }, []);

  async function handleSave(session: WorkoutSession) {
    await saveWorkout(session);
    setWorkouts(await getWorkouts());
    setShowForm(false);
    setSelectedType(null);
  }

  async function handleDelete(id: string) {
    await deleteWorkout(id);
    setWorkouts(await getWorkouts());
  }

  const dayWorkouts = workouts.filter((w) => w.date === filterDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="mt-1 text-sm text-neutral-500 bg-transparent border-none outline-none cursor-pointer" />
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-(--color-accent) text-black font-semibold px-3 py-2 rounded-xl hover:opacity-90 text-sm">
            <Plus size={16} /> Log Workout
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
          {!selectedType ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Choose workout type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.entries(TYPE_CONFIG) as [WorkoutType, typeof TYPE_CONFIG[WorkoutType]][]).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-(--color-border) hover:border-neutral-600 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.color + "22", color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    <span className="font-medium text-sm">{cfg.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowForm(false)} className="w-full py-2.5 rounded-xl border border-(--color-border) text-neutral-400 text-sm hover:text-white transition-colors">Cancel</button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: TYPE_CONFIG[selectedType].color + "22", color: TYPE_CONFIG[selectedType].color }}>
                  {TYPE_CONFIG[selectedType].icon}
                </span>
                <h2 className="font-bold">{TYPE_CONFIG[selectedType].label} Workout</h2>
              </div>
              {selectedType === "run" && <RunForm onSave={handleSave} onCancel={() => { setShowForm(false); setSelectedType(null); }} />}
              {selectedType === "hyrox" && <HyroxForm onSave={handleSave} onCancel={() => { setShowForm(false); setSelectedType(null); }} />}
              {["push", "pull", "legs"].includes(selectedType) && (
                <StrengthForm
                  type={selectedType as "push" | "pull" | "legs"}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setSelectedType(null); }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {dayWorkouts.length === 0 && !showForm ? (
        <div className="text-center py-12 text-neutral-600">
          <Dumbbell size={32} className="mx-auto mb-3 text-neutral-700" />
          <p>No workouts logged for this day.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-(--color-accent) hover:opacity-80">+ Log a workout</button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayWorkouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} onDelete={() => handleDelete(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense>
      <WorkoutsContent />
    </Suspense>
  );
}
