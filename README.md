# Hybrid Tracker

I train like a hybrid athlete. Push/pull/legs in the gym, two runs a week, and the occasional Hyrox session. I recently completed a 20km run and I'm now building toward competing in a Hyrox race at the start of 2027. I also try to eat well and stay at a consistent weight. The problem was never motivation. The problem was that tracking all of it felt like a second job.

And I know I'm not the only one.

There's a whole generation of people in their 20s and 30s trying to do this exact thing. Students and young professionals who work full days, hit the gym before or after, squeeze in a long run on the weekend, and are genuinely trying to build a body that performs at both strength and endurance. The hybrid athlete movement has exploded, Hyrox races are selling out across Europe, and more people than ever are following training programs that mix lifting with running.

But the tools haven't caught up. Every app out there is built for one thing. Runners use Garmin or Strava. Lifters use Strong or Hevy. People tracking macros use MyFitnessPal. If you do all three, you end up living across four different apps, none of them talking to each other, and none of them giving you a single clear picture of whether you're actually on track.

I was juggling three different apps and still had no real sense of whether I was doing well or just going through the motions. So I built this.

## What it does

**Meals** - Log what you eat, hit your daily macro targets. I built in my own meal plan as one-tap presets so logging a standard day takes seconds. For anything custom, you just describe the meal in plain English and AI fills in the calories and macros automatically.

**Workouts** - Log strength sessions by exercise with sets, reps, and weight. Log runs with distance, time, and auto-calculated pace. Log Hyrox sessions station by station. Everything in one place.

**Weight** - Daily weigh-ins with a 30-day trend chart, a goal line, and a running history so you can actually see progress over time.

**Dashboard** - A daily score (0-100) that tells you at a glance whether you've nailed your calories, protein, and workout for the day. A streak counter to keep the habit alive. Everything you need, nothing you don't.

## How it's built

- **Next.js 16** (App Router)
- **Tailwind CSS v4** with a dark theme
- **localStorage** - no database, no account, no cloud sync. Your data stays on your device.
- **Recharts** for the weight trend chart
- **Claude Haiku** for AI macro estimation when you describe a meal in free text

## Running locally

```bash
npm install
npm run dev
```

## Why I built it myself

Every fitness app I tried was either too generic, too complicated, or trying to sell me a subscription to unlock the features that actually mattered.

MyFitnessPal is fine if all you care about is food. Strava is great if you only run. Strong works well for the gym. But none of them talk to each other, and none of them were built for someone doing all three. I'd finish a solid training week, feel like I was on track, and have absolutely no way to verify it because my data was scattered across four different places.

What made it worse is that the window for training is small. Between work, studying, commuting, and trying to have a life, you get maybe an hour a day. The last thing you want to spend that time on is manually reconciling apps or trying to remember if you hit your protein yesterday. The friction of tracking was quietly killing the habit.

I also found that most apps are built for people who just want to lose weight or run their first 5k. Nothing wrong with that. But when you're chasing a Hyrox finish line while also trying to get stronger and stay lean, you need something that understands the full picture. The strength sessions, the long runs, the macro precision, the weight trend over time. All of it matters and all of it is connected.

So I stopped looking for the right app and built exactly what I needed. It took a few hours. It has no ads, no premium tier, no algorithm trying to keep me engaged. It just tracks what I care about and tells me at the end of each day whether I showed up or not. That's all I ever wanted.
