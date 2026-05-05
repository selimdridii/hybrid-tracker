# Hybrid Tracker

I train like a hybrid athlete — push/pull/legs in the gym, two runs a week, and the occasional Hyrox session. I also try to eat well and stay at a consistent weight. The problem was never motivation. The problem was that tracking all of it felt like a second job.

I was juggling three different apps, none of them talking to each other, none of them built for someone who does both strength and endurance work. I'd log a workout in one place, forget to log my meals in another, and have no real sense of whether I was actually on track or just going through the motions.

So I built this.

## What it does

**Meals** — Log what you eat, hit your daily macro targets. I built in my own meal plan as one-tap presets so logging a standard day takes seconds. For anything custom, you just describe the meal in plain English and AI fills in the calories and macros automatically.

**Workouts** — Log strength sessions by exercise with sets, reps, and weight. Log runs with distance, time, and auto-calculated pace. Log Hyrox sessions station by station. Everything in one place.

**Weight** — Daily weigh-ins with a 30-day trend chart, a goal line, and a running history so you can actually see progress over time.

**Dashboard** — A daily score (0–100) that tells you at a glance whether you've nailed your calories, protein, and workout for the day. A streak counter to keep the habit alive. Everything you need, nothing you don't.

## How it's built

- **Next.js 16** (App Router) — the whole thing is a client-side app with no backend except one API route
- **Tailwind CSS v4** — dark theme with a neon green accent because it felt right
- **localStorage** — no database, no account, no cloud sync. Your data stays on your device.
- **Recharts** — for the weight trend chart
- **Claude Haiku** (Anthropic) — powers the AI macro estimation when you describe a meal in free text

## Running locally

```bash
npm install
npm run dev
```

Add an `ANTHROPIC_API_KEY` environment variable if you want the AI macro estimation to work:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Why I built it myself

Every fitness app I tried was either too generic, too complicated, or trying to sell me a subscription. I wanted something that matched exactly how I train and eat — no more, no less. Building it took a few hours. Now I actually use it every day.
