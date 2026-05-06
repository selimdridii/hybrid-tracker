import { getSupabase } from './supabase'
import { WorkoutSession, MealEntry, WeightEntry, Targets, DEFAULT_TARGETS } from './types'

// ── Workouts ──────────────────────────────────────────────────────────────────

export async function getWorkouts(): Promise<WorkoutSession[]> {
  const { data } = await getSupabase().from('workouts').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(mapWorkout)
}

export async function saveWorkout(session: WorkoutSession) {
  await getSupabase().from('workouts').upsert(workoutToRow(session))
}

export async function deleteWorkout(id: string) {
  await getSupabase().from('workouts').delete().eq('id', id)
}

// ── Meals ─────────────────────────────────────────────────────────────────────

export async function getMeals(): Promise<MealEntry[]> {
  const { data } = await getSupabase().from('meals').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(mapMeal)
}

export async function saveMeal(meal: MealEntry) {
  await getSupabase().from('meals').upsert(mealToRow(meal))
}

export async function deleteMeal(id: string) {
  await getSupabase().from('meals').delete().eq('id', id)
}

// ── Weights ───────────────────────────────────────────────────────────────────

export async function getWeights(): Promise<WeightEntry[]> {
  const { data } = await getSupabase().from('weights').select('*').order('date', { ascending: false })
  return (data ?? []).map(mapWeight)
}

export async function saveWeight(entry: WeightEntry) {
  await getSupabase().from('weights').upsert(weightToRow(entry))
}

export async function deleteWeight(id: string) {
  await getSupabase().from('weights').delete().eq('id', id)
}

// ── Targets ───────────────────────────────────────────────────────────────────

export async function getTargets(): Promise<Targets> {
  const { data } = await getSupabase().from('targets').select('*').eq('id', 'default').maybeSingle()
  if (!data) return DEFAULT_TARGETS
  return {
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    weightGoal: data.weight_goal ?? undefined,
  }
}

export async function saveTargets(targets: Targets) {
  await getSupabase().from('targets').upsert({
    id: 'default',
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
    weight_goal: targets.weightGoal ?? null,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function getMealsForDate(date: string): Promise<MealEntry[]> {
  const { data } = await getSupabase().from('meals').select('*').eq('date', date)
  return (data ?? []).map(mapMeal)
}

export async function getWorkoutsForDate(date: string): Promise<WorkoutSession[]> {
  const { data } = await getSupabase().from('workouts').select('*').eq('date', date)
  return (data ?? []).map(mapWorkout)
}

export async function computeStreak(): Promise<number> {
  const [w, wt, m] = await Promise.all([
    getSupabase().from('workouts').select('date'),
    getSupabase().from('weights').select('date'),
    getSupabase().from('meals').select('date'),
  ])
  const allDates = new Set([
    ...(w.data ?? []).map((r) => r.date),
    ...(wt.data ?? []).map((r) => r.date),
    ...(m.data ?? []).map((r) => r.date),
  ])
  let streak = 0
  const d = new Date()
  while (true) {
    const dateStr = d.toISOString().split('T')[0]
    if (!allDates.has(dateStr)) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

// ── Row mappers ───────────────────────────────────────────────────────────────

type Row = Record<string, unknown>

function mapWorkout(r: Row): WorkoutSession {
  return {
    id: r.id as string,
    date: r.date as string,
    type: r.type as WorkoutSession['type'],
    duration: r.duration as number | undefined,
    exercises: r.exercises as WorkoutSession['exercises'],
    distance: r.distance as number | undefined,
    pace: r.pace as string | undefined,
    time: r.time as string | undefined,
    stations: r.stations as WorkoutSession['stations'],
    notes: r.notes as string | undefined,
  }
}

function workoutToRow(s: WorkoutSession) {
  return {
    id: s.id,
    date: s.date,
    type: s.type,
    duration: s.duration ?? null,
    exercises: s.exercises ?? null,
    distance: s.distance ?? null,
    pace: s.pace ?? null,
    time: s.time ?? null,
    stations: s.stations ?? null,
    notes: s.notes ?? null,
  }
}

function mapMeal(r: Row): MealEntry {
  return {
    id: r.id as string,
    date: r.date as string,
    mealType: r.meal_type as MealEntry['mealType'],
    name: r.name as string,
    calories: r.calories as number,
    protein: r.protein as number,
    carbs: r.carbs as number,
    fat: r.fat as number,
  }
}

function mealToRow(m: MealEntry) {
  return {
    id: m.id,
    date: m.date,
    meal_type: m.mealType,
    name: m.name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
  }
}

function mapWeight(r: Row): WeightEntry {
  return {
    id: r.id as string,
    date: r.date as string,
    weight: r.weight as number,
  }
}

function weightToRow(e: WeightEntry) {
  return { id: e.id, date: e.date, weight: e.weight }
}
