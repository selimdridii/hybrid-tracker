-- Run this once in your Supabase SQL editor

create table meals (
  id text primary key,
  date text not null,
  meal_type text not null,
  name text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  created_at timestamptz default now()
);

create table workouts (
  id text primary key,
  date text not null,
  type text not null,
  duration integer,
  exercises jsonb,
  distance float,
  pace text,
  time text,
  stations jsonb,
  notes text,
  created_at timestamptz default now()
);

create table weights (
  id text primary key,
  date text not null,
  weight float not null,
  created_at timestamptz default now()
);

create table targets (
  id text primary key default 'default',
  calories integer not null default 2200,
  protein integer not null default 160,
  carbs integer not null default 210,
  fat integer not null default 80,
  weight_goal float
);

-- Disable RLS (personal app, single user)
alter table meals disable row level security;
alter table workouts disable row level security;
alter table weights disable row level security;
alter table targets disable row level security;
