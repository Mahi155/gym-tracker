// One-time seed data, parsed from the user's existing workout log into
// structured sets: { weight, reps }. Anything that didn't fit weight/reps
// (equipment, difficulty, caveats) is kept as a short exercise-level note so
// no detail from the original log was lost.
// Only used to initialize localStorage on first run (never overwrites real data).
// Dates for the very first (originally undated) Pull/Leg/Push entries were
// approximated to 2026-01-29, matching the first body-weight log entry.
// Where the original log recorded a weight but no rep count, reps default to
// 12 for the first set and 10 for the second, matching the user's usual
// 12/10 rep scheme (explicitly noted on many later sessions).
var SEED_DATA = {
  version: 2,
  routines: {
    pull: {
      label: "Pull",
      exercises: ["Bent over row", "Pullup", "Lat pull down", "Seated row", "Face pull", "Dumbbell curl", "Hammer curl"]
    },
    push: {
      label: "Push",
      exercises: ["Bench", "Incline", "Fly machine", "Shoulder press", "Tricep pushdown", "Tricep overhead", "Lateral raises"]
    },
    leg: {
      label: "Leg",
      exercises: ["Squats", "Dead lifts", "Seated leg", "Seated leg curl"]
    }
  },
  bodyWeight: [
    { id: "sw0", date: "2026-01-29", value: 176.6 },
    { id: "sw1", date: "2026-02-03", value: 175.4 },
    { id: "sw2", date: "2026-02-16", value: 174 },
    { id: "sw3", date: "2026-02-24", value: 174.2 },
    { id: "sw4", date: "2026-03-03", value: 175 },
    { id: "sw5", date: "2026-04-10", value: 174.8 },
    { id: "sw6", date: "2026-04-17", value: 176.6 },
    { id: "sw7", date: "2026-04-22", value: 176.4 },
    { id: "sw8", date: "2026-04-28", value: 173 },
    { id: "sw9", date: "2026-05-14", value: 174.4 },
    { id: "sw10", date: "2026-06-10", value: 177.2 }
  ],
  sessions: [
    { date: "2026-01-29", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 80, reps: 12 }, { weight: 70, reps: 10 }, { weight: 60, reps: 4 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 4 }] },
      { exercise: "Face pull", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }, { weight: 30, reps: null }] }
    ]},
    { date: "2026-01-29", routineId: "leg", entries: [
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 4 }, { weight: 25, reps: 2 }] },
      { exercise: "Squats", sets: [{ weight: 25, reps: 2 }, { weight: 25, reps: 2 }] },
      { exercise: "Dead lifts", sets: [{ weight: 35, reps: 2 }, { weight: 45, reps: 2 }] }
    ]},
    { date: "2026-01-29", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }], note: "barbell" },
      { exercise: "Incline", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }], note: "dumbbell, can do 30" },
      { exercise: "Fly machine", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }] },
      { exercise: "Tricep pushdown", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }], note: "hard" },
      { exercise: "Lateral raises", sets: [{ weight: 40, reps: 12 }, { weight: 55, reps: 10 }] }
    ]},
    { date: "2026-02-26", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 35, reps: 12 }, { weight: 35, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 70, reps: 12 }, { weight: 60, reps: 5 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 2 }], note: "maybe 3 reps" },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 6 }] },
      { exercise: "Face pull", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }, { weight: 35, reps: null }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 15, reps: 12 }, { weight: 20, reps: 10 }], note: "each side" },
      { exercise: "Hammer curl", sets: [{ weight: 15, reps: 12 }, { weight: 15, reps: 10 }], note: "each side" }
    ]},
    { date: "2026-03-05", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }], note: "barbell" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }] },
      { exercise: "Fly machine", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 10 }], note: "last time did 50" },
      { exercise: "Tricep pushdown", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Tricep overhead", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 55, reps: 10 }] }
    ]},
    { date: "2026-03-06", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 70, reps: 12 }, { weight: 60, reps: 6 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 5 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 6 }] },
      { exercise: "Face pull", sets: [{ weight: 30, reps: 12 }, { weight: 35, reps: 10 }], note: "can do 40" },
      { exercise: "Dumbbell curl", sets: [{ weight: 20, reps: 6 }, { weight: 20, reps: 10 }], note: "each side" },
      { exercise: "Hammer curl", sets: [{ weight: 20, reps: 12 }], note: "each side, only one set" }
    ]},
    { date: "2026-03-07", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 4 }, { weight: 25, reps: 2 }] },
      { exercise: "Squats", sets: [{ weight: 25, reps: 2 }], note: "2nd set not done" },
      { exercise: "Dead lifts", sets: [{ weight: 45, reps: 2 }, { weight: 45, reps: 2 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 10 }] }
    ]},
    { date: "2026-03-12", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }] },
      { exercise: "Tricep pushdown", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Tricep overhead", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 65, reps: 10 }] }
    ]},
    { date: "2026-03-13", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 70, reps: 12 }, { weight: 60, reps: 6 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 20, reps: 6 }, { weight: 20, reps: 10 }], note: "each side" },
      { exercise: "Hammer curl", sets: [{ weight: 20, reps: 12 }], note: "each side, only one set" }
    ]},
    { date: "2026-03-16", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 6 }] },
      { exercise: "Squats", sets: [{ weight: 25, reps: 2 }], note: "knee pain, next set skipped" },
      { exercise: "Dead lifts", sets: [{ weight: 45, reps: 2 }, { weight: 55, reps: 2 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] }
    ]},
    { date: "2026-03-25", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }] },
      { exercise: "Tricep pushdown", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Tricep overhead", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 65, reps: 10 }] }
    ]},
    { date: "2026-03-26", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 60, reps: 12 }, { weight: 60, reps: 4 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 20, reps: 6 }, { weight: 20, reps: 10 }], note: "each side" },
      { exercise: "Hammer curl", sets: [{ weight: 20, reps: 12 }], note: "each side, only one set" }
    ]},
    { date: "2026-04-06", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 10 }], note: "hard" },
      { exercise: "Tricep pushdown", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }], note: "easy with rod" },
      { exercise: "Tricep overhead", sets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 65, reps: 10 }] }
    ]},
    { date: "2026-04-07", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 60, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 5 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }], note: "machine" }
    ]},
    { date: "2026-04-10", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 6 }] },
      { exercise: "Dead lifts", sets: [{ weight: 45, reps: 2 }, { weight: 70, reps: 4 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] }
    ]},
    { date: "2026-04-13", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each; did decline instead" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 4 }], note: "2nd set only 4 reps" },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 6 }, { weight: 40, reps: 10 }], note: "aiming for 12/10 rep scheme" },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 12 }, { weight: 32.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 32.5, reps: 10 }], note: "hard" },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 65, reps: 10 }] }
    ]},
    { date: "2026-04-15", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 60, reps: 12 }, { weight: 50, reps: 10 }], note: "very hard" },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 7 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 90, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }], note: "machine" }
    ]},
    { date: "2026-04-19", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", sets: [{ weight: 25, reps: 2 }] },
      { exercise: "Dead lifts", sets: [{ weight: 60, reps: 2 }, { weight: 60, reps: 2 }], note: "focus on form" },
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 6 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] }
    ]},
    { date: "2026-04-23", routineId: "push", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 4 }], note: "2nd set only 4 reps" },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 6 }, { weight: 40, reps: 10 }], note: "aiming for 12/10 rep scheme" },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 12 }, { weight: 32.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 27.5, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 55, reps: 12 }, { weight: 55, reps: 10 }] }
    ]},
    { date: "2026-04-25", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 55, reps: 12 }], note: "hard" },
      { exercise: "Lat pull down", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }], note: "felt good" },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 35, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }], note: "machine" }
    ]},
    { date: "2026-04-27", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", sets: [{ weight: 25, reps: 2 }] },
      { exercise: "Dead lifts", sets: [{ weight: 60, reps: 2 }, { weight: 60, reps: 2 }], note: "focus on form" },
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 4 }, { weight: 45, reps: 6 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] }
    ]},
    { date: "2026-04-30", routineId: "push", note: "12/10 rep scheme", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 30, reps: 6 }, { weight: 30, reps: 5 }], note: "barbell, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 8 }, { weight: 40, reps: 10 }], note: "aiming for 12/10 rep scheme" },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 12 }, { weight: 32.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 27.5, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 6 }] }
    ]},
    { date: "2026-05-01", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 45, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 55, reps: 6 }, { weight: 55, reps: 4 }], note: "hard" },
      { exercise: "Lat pull down", sets: [{ weight: 85, reps: 10 }, { weight: 85, reps: 10 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 37.5, reps: 12 }, { weight: 42.5, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 50, reps: 12 }, { weight: 65, reps: 8 }], note: "machine" }
    ]},
    { date: "2026-05-05", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }] },
      { exercise: "Dead lifts", sets: [{ weight: 60, reps: 10 }, { weight: 70, reps: 6 }] },
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 10 }, { weight: 45, reps: 6 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 65, reps: 12 }, { weight: 80, reps: 6 }] }
    ]},
    { date: "2026-05-13", routineId: "push", note: "12/10 rep scheme", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 10 }], note: "barbell" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 85, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 40, reps: 8 }, { weight: 40, reps: 10 }], note: "aiming for 12/10 rep scheme" },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 12 }, { weight: 32.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 27.5, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 55, reps: 12 }, { weight: 70, reps: 6 }] }
    ]},
    { date: "2026-05-15", routineId: "pull", entries: [
      { exercise: "Pullup", sets: [{ weight: 55, reps: 6 }, { weight: 55, reps: 4 }], note: "hard" },
      { exercise: "Lat pull down", sets: [{ weight: 85, reps: 12 }, { weight: 100, reps: 6 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 14 }, { weight: 85, reps: 12 }] },
      { exercise: "Face pull", sets: [{ weight: 40, reps: 12 }, { weight: 50, reps: 10 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 65, reps: 10 }, { weight: 65, reps: 6 }], note: "machine" }
    ]},
    { date: "2026-06-24", routineId: "push", note: "12/10 rep scheme", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 10 }] },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 8 }, { weight: 27.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 22.5, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 50, reps: 10 }] }
    ]},
    { date: "2026-06-25", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 42.5, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 55, reps: 6 }, { weight: 55, reps: 4 }], note: "hard" },
      { exercise: "Lat pull down", sets: [{ weight: 85, reps: 10 }, { weight: 100, reps: 4 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 10 }, { weight: 85, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 40, reps: 8 }, { weight: 40, reps: 8 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 65, reps: 8 }, { weight: 65, reps: 6 }], note: "machine" }
    ]},
    { date: "2026-06-26", routineId: "leg", entries: [
      { exercise: "Squats", sets: [], note: "empty rod, form only" },
      { exercise: "Dead lifts", sets: [{ weight: 60, reps: 6 }, { weight: 60, reps: 6 }] },
      { exercise: "Seated leg", sets: [{ weight: 45, reps: 6 }, { weight: 45, reps: 6 }] },
      { exercise: "Seated leg curl", sets: [{ weight: 70, reps: 10 }, { weight: 85, reps: 8 }] }
    ]},
    { date: "2026-07-07", routineId: "push", note: "10/8 rep scheme", entries: [
      { exercise: "Bench", sets: [{ weight: 25, reps: 12 }, { weight: 25, reps: 10 }], note: "each" },
      { exercise: "Incline", sets: [{ weight: 25, reps: 12 }, { weight: 30, reps: 10 }], note: "machine, each" },
      { exercise: "Fly machine", sets: [{ weight: 70, reps: 12 }, { weight: 70, reps: 10 }] },
      { exercise: "Shoulder press", sets: [{ weight: 30, reps: 12 }, { weight: 40, reps: 10 }] },
      { exercise: "Tricep pushdown", sets: [{ weight: 27.5, reps: 8 }, { weight: 27.5, reps: 10 }], note: "rod attachment" },
      { exercise: "Tricep overhead", sets: [{ weight: 27.5, reps: 12 }, { weight: 22.5, reps: 10 }] },
      { exercise: "Lateral raises", sets: [{ weight: 50, reps: 12 }, { weight: 50, reps: 10 }] }
    ]},
    { date: "2026-07-09", routineId: "pull", entries: [
      { exercise: "Bent over row", sets: [{ weight: 40, reps: 12 }, { weight: 42.5, reps: 10 }] },
      { exercise: "Pullup", sets: [{ weight: 55, reps: 6 }, { weight: 55, reps: 4 }], note: "hard" },
      { exercise: "Lat pull down", sets: [{ weight: 85, reps: 12 }, { weight: 100, reps: 10 }] },
      { exercise: "Seated row", sets: [{ weight: 70, reps: 10 }, { weight: 85, reps: 10 }] },
      { exercise: "Face pull", sets: [{ weight: 40, reps: 8 }, { weight: 45, reps: 6 }] },
      { exercise: "Dumbbell curl", sets: [{ weight: 65, reps: 8 }, { weight: 65, reps: 6 }], note: "machine" }
    ]}
  ]
};
