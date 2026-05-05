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
  calories: 2200,
  protein: 160,
  carbs: 210,
  fat: 80,
}

export interface MealPreset {
  mealType: MealEntry['mealType']
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Macros calculated from your default meal plan
export const MEAL_PRESETS: MealPreset[] = [
  {
    mealType: 'breakfast',
    name: 'Skyr Bowl',
    description: '250g skyr · 2 tbsp chia seeds · 2 tbsp honey · 1 banana',
    calories: 500,
    protein: 29,
    carbs: 83,
    fat: 6,
  },
  {
    mealType: 'lunch',
    name: 'Rice & Beef Bowl',
    description: '100g basmati rice · 300g beef mince · apple · ½ avocado',
    calories: 1000,
    protein: 72,
    carbs: 109,
    fat: 33,
  },
  {
    mealType: 'lunch',
    name: 'Quinoa & Beef Bowl',
    description: '100g quinoa · 300g beef mince · apple · ½ avocado',
    calories: 1010,
    protein: 79,
    carbs: 95,
    fat: 38,
  },
  {
    mealType: 'snack',
    name: 'Kiwi & Almonds',
    description: '1 kiwi · 30g almonds',
    calories: 220,
    protein: 7,
    carbs: 16,
    fat: 15,
  },
  {
    mealType: 'snack',
    name: 'Berries & Almonds',
    description: '100g mixed berries · 30g almonds',
    calories: 231,
    protein: 7,
    carbs: 19,
    fat: 16,
  },
  {
    mealType: 'dinner',
    name: 'Tuna Salad',
    description: 'Mixed salad · 2 eggs · 140g tuna · 1 tbsp olive oil',
    calories: 468,
    protein: 52,
    carbs: 5,
    fat: 26,
  },
  {
    mealType: 'dinner',
    name: 'Salmon Salad',
    description: 'Mixed salad · 2 eggs · 150g salmon · 1 tbsp olive oil',
    calories: 580,
    protein: 51,
    carbs: 5,
    fat: 38,
  },
]

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
