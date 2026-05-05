export type WorkoutType = 'push' | 'pull' | 'legs' | 'run' | 'hyrox'

export interface Exercise {
  name: string
  sets: { reps: number; weight: number }[]
}

export interface HyroxStation {
  name: string
  target: string
  completed: boolean
  result?: string
}

export interface WorkoutSession {
  id: string
  date: string
  type: WorkoutType
  duration?: number
  exercises?: Exercise[]
  distance?: number
  pace?: string
  time?: string
  stations?: HyroxStation[]
  notes?: string
}

export interface MealEntry {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
}

export interface Targets {
  calories: number
  protein: number
  carbs: number
  fat: number
  weightGoal?: number
}

export const DEFAULT_TARGETS: Targets = {
  calories: 2500,
  protein: 180,
  carbs: 280,
  fat: 70,
}

export const HYROX_STATIONS: HyroxStation[] = [
  { name: 'SkiErg', target: '1000m', completed: false },
  { name: 'Sled Push', target: '50m', completed: false },
  { name: 'Sled Pull', target: '50m', completed: false },
  { name: 'Burpee Broad Jumps', target: '80m', completed: false },
  { name: 'Rowing', target: '1000m', completed: false },
  { name: 'Farmers Carry', target: '200m', completed: false },
  { name: 'Sandbag Lunges', target: '100m', completed: false },
  { name: 'Wall Balls', target: '100 reps', completed: false },
]

export const WORKOUT_EXERCISES: Record<string, string[]> = {
  push: [
    'Bench Press', 'Incline Bench Press', 'Shoulder Press',
    'Lateral Raises', 'Tricep Pushdowns', 'Dips', 'Cable Flyes',
  ],
  pull: [
    'Pull-ups', 'Barbell Rows', 'Cable Rows', 'Lat Pulldown',
    'Face Pulls', 'Bicep Curls', 'Hammer Curls', 'Shrugs',
  ],
  legs: [
    'Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges',
    'Leg Curl', 'Leg Extension', 'Calf Raises', 'Hip Thrust',
  ],
}
