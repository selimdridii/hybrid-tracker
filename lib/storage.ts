import { WorkoutSession, MealEntry, WeightEntry, Targets, DEFAULT_TARGETS } from './types'

const KEYS = {
  workouts: 'ht_workouts',
  meals: 'ht_meals',
  weights: 'ht_weights',
  targets: 'ht_targets',
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getWorkouts(): WorkoutSession[] {
  return load<WorkoutSession[]>(KEYS.workouts, [])
}
export function saveWorkout(session: WorkoutSession) {
  const all = getWorkouts()
  const idx = all.findIndex(w => w.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  save(KEYS.workouts, all)
}
export function deleteWorkout(id: string) {
  save(KEYS.workouts, getWorkouts().filter(w => w.id !== id))
}

export function getMeals(): MealEntry[] {
  return load<MealEntry[]>(KEYS.meals, [])
}
export function saveMeal(meal: MealEntry) {
  const all = getMeals()
  const idx = all.findIndex(m => m.id === meal.id)
  if (idx >= 0) all[idx] = meal
  else all.unshift(meal)
  save(KEYS.meals, all)
}
export function deleteMeal(id: string) {
  save(KEYS.meals, getMeals().filter(m => m.id !== id))
}

export function getWeights(): WeightEntry[] {
  return load<WeightEntry[]>(KEYS.weights, [])
}
export function saveWeight(entry: WeightEntry) {
  const all = getWeights()
  const idx = all.findIndex(w => w.id === entry.id)
  if (idx >= 0) all[idx] = entry
  else all.unshift(entry)
  save(KEYS.weights, all)
}
export function deleteWeight(id: string) {
  save(KEYS.weights, getWeights().filter(w => w.id !== id))
}

export function getTargets(): Targets {
  return load<Targets>(KEYS.targets, DEFAULT_TARGETS)
}
export function saveTargets(targets: Targets) {
  save(KEYS.targets, targets)
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMealsForDate(date: string): MealEntry[] {
  return getMeals().filter(m => m.date === date)
}

export function getWorkoutsForDate(date: string): WorkoutSession[] {
  return getWorkouts().filter(w => w.date === date)
}

export function computeStreak(): number {
  const workouts = getWorkouts()
  const weights = getWeights()
  const meals = getMeals()
  const allDates = new Set([
    ...workouts.map(w => w.date),
    ...weights.map(w => w.date),
    ...meals.map(m => m.date),
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

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
