// One-time seed data, parsed from the user's existing workout log.
// Only used to initialize localStorage on first run (never overwrites real data).
// Dates for the very first (originally undated) Pull/Leg/Push entries were
// approximated to 2026-01-29, matching the first body-weight log entry.
var SEED_DATA = {
  version: 1,
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
    { date: "2026-01-29", value: 176.6 },
    { date: "2026-02-03", value: 175.4 },
    { date: "2026-02-16", value: 174 },
    { date: "2026-02-24", value: 174.2 },
    { date: "2026-03-03", value: 175 },
    { date: "2026-04-10", value: 174.8 },
    { date: "2026-04-17", value: 176.6 },
    { date: "2026-04-22", value: 176.4 },
    { date: "2026-04-28", value: 173 },
    { date: "2026-05-14", value: 174.4 },
    { date: "2026-06-10", value: 177.2 }
  ].map(function (w, i) { return Object.assign({ id: "sw" + i }, w); }),
  sessions: [
    { date: "2026-01-29", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "30,30" },
      { exercise: "Pullup", text: "80,70 60-4" },
      { exercise: "Lat pull down", text: "70, 70" },
      { exercise: "Seated row", text: "70, 90-4" },
      { exercise: "Face pull", text: "20,25,30" }
    ]},
    { date: "2026-01-29", routineId: "leg", entries: [
      { exercise: "Seated leg", text: "45*4, 45*4, plus 25*2" },
      { exercise: "Squats", text: "25*2,25*2" },
      { exercise: "Dead lifts", text: "35*2, 45*2" }
    ]},
    { date: "2026-01-29", routineId: "push", entries: [
      { exercise: "Bench", text: "20, 25 barbell" },
      { exercise: "Incline", text: "20,25 dumbbell can do 30" },
      { exercise: "Fly machine", text: "55, 70" },
      { exercise: "Shoulder press", text: "40,50" },
      { exercise: "Tricep pushdown", text: "20,25 hard" },
      { exercise: "Lateral raises", text: "40,55" }
    ]},
    { date: "2026-02-26", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "35, 35" },
      { exercise: "Pullup", text: "70, 60-5" },
      { exercise: "Lat pull down", text: "70, 85 - 2 or 3" },
      { exercise: "Seated row", text: "70, 90-6" },
      { exercise: "Face pull", text: "25,30, 35" },
      { exercise: "Dumbbell curl", text: "15 each, 20 each" },
      { exercise: "Hammer curl", text: "15 each, 15 each" }
    ]},
    { date: "2026-03-05", routineId: "push", entries: [
      { exercise: "Bench", text: "20, 25 barbell" },
      { exercise: "Incline", text: "25, 30" },
      { exercise: "Fly machine", text: "55, 70" },
      { exercise: "Shoulder press", text: "40, 40 last time 50" },
      { exercise: "Tricep pushdown", text: "20, 25" },
      { exercise: "Tricep overhead", text: "20, 25" },
      { exercise: "Lateral raises", text: "50, 55" }
    ]},
    { date: "2026-03-06", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "35, 40" },
      { exercise: "Pullup", text: "70, 60-6" },
      { exercise: "Lat pull down", text: "70, 85 - 5" },
      { exercise: "Seated row", text: "70, 90-6" },
      { exercise: "Face pull", text: "30, 35 can do 40" },
      { exercise: "Dumbbell curl", text: "20 each 6, 20 each" },
      { exercise: "Hammer curl", text: "20 each only one set" }
    ]},
    { date: "2026-03-07", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", text: "45*4, 45*4, plus 25*2" },
      { exercise: "Squats", text: "25*2,25*2 didnt do" },
      { exercise: "Dead lifts", text: "45*2, 45*2" },
      { exercise: "Seated leg curl", text: "55, 70" }
    ]},
    { date: "2026-03-12", routineId: "push", entries: [
      { exercise: "Bench", text: "25, 25 each" },
      { exercise: "Incline", text: "25, 30 machine each" },
      { exercise: "Fly machine", text: "55, 70" },
      { exercise: "Shoulder press", text: "40, 50" },
      { exercise: "Tricep pushdown", text: "20, 25" },
      { exercise: "Tricep overhead", text: "20, 25" },
      { exercise: "Lateral raises", text: "50, 65" }
    ]},
    { date: "2026-03-13", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 40" },
      { exercise: "Pullup", text: "70, 60-6" },
      { exercise: "Lat pull down", text: "70, 85" },
      { exercise: "Seated row", text: "70, 90" },
      { exercise: "Face pull", text: "35, 40" },
      { exercise: "Dumbbell curl", text: "20 each 6, 20 each" },
      { exercise: "Hammer curl", text: "20 each only one set" }
    ]},
    { date: "2026-03-16", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", text: "45*4, 45*6" },
      { exercise: "Squats", text: "25*2, knee pain didnt do next set" },
      { exercise: "Dead lifts", text: "45*2, 55*2" },
      { exercise: "Seated leg curl", text: "70, 85" }
    ]},
    { date: "2026-03-25", routineId: "push", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "25, 30 machine each" },
      { exercise: "Fly machine", text: "70, 70" },
      { exercise: "Shoulder press", text: "40, 50" },
      { exercise: "Tricep pushdown", text: "20, 25" },
      { exercise: "Tricep overhead", text: "20, 25" },
      { exercise: "Lateral raises", text: "50, 65" }
    ]},
    { date: "2026-03-26", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 40" },
      { exercise: "Pullup", text: "60, 60 - 4" },
      { exercise: "Lat pull down", text: "70, 85" },
      { exercise: "Seated row", text: "70, 90" },
      { exercise: "Face pull", text: "35, 40" },
      { exercise: "Dumbbell curl", text: "20 each 6, 20 each" },
      { exercise: "Hammer curl", text: "20 each only one set" }
    ]},
    { date: "2026-04-06", routineId: "push", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "25, 30 machine each" },
      { exercise: "Fly machine", text: "70, 70" },
      { exercise: "Shoulder press", text: "40, 40 hard" },
      { exercise: "Tricep pushdown", text: "20, 25 easy with rod" },
      { exercise: "Tricep overhead", text: "20, 25" },
      { exercise: "Lateral raises", text: "50, 65" }
    ]},
    { date: "2026-04-07", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 45" },
      { exercise: "Pullup", text: "60, 70" },
      { exercise: "Lat pull down", text: "70, 85 - 5" },
      { exercise: "Seated row", text: "70, 90" },
      { exercise: "Face pull", text: "35, 40" },
      { exercise: "Dumbbell curl", text: "40, 50 machine" }
    ]},
    { date: "2026-04-10", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Seated leg", text: "45*4, 45*6" },
      { exercise: "Dead lifts", text: "45*2, 70*2 4 reps" },
      { exercise: "Seated leg curl", text: "70, 85" }
    ]},
    { date: "2026-04-13", routineId: "push", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "25, 30 machine each - Did decline" },
      { exercise: "Fly machine", text: "70, 70 only 4" },
      { exercise: "Shoulder press", text: "40, 40 got 6 doing 12, 10 sets" },
      { exercise: "Tricep pushdown", text: "27.5, 32.5 rod" },
      { exercise: "Tricep overhead", text: "27.5, 32.5 hard" },
      { exercise: "Lateral raises", text: "50, 65" }
    ]},
    { date: "2026-04-15", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 45" },
      { exercise: "Pullup", text: "60, 50 v hard" },
      { exercise: "Lat pull down", text: "70, 85 - 7" },
      { exercise: "Seated row", text: "70, 90" },
      { exercise: "Face pull", text: "35, 40" },
      { exercise: "Dumbbell curl", text: "40, 50 machine" }
    ]},
    { date: "2026-04-19", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", text: "25*2" },
      { exercise: "Dead lifts", text: "60*2, 60*2 focus on form" },
      { exercise: "Seated leg", text: "45*4, 45*6" },
      { exercise: "Seated leg curl", text: "70, 85" }
    ]},
    { date: "2026-04-23", routineId: "push", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "25, 30 machine each" },
      { exercise: "Fly machine", text: "70, 70 only 4" },
      { exercise: "Shoulder press", text: "40, 40 got 6 doing 12, 10 sets" },
      { exercise: "Tricep pushdown", text: "27.5, 32.5 rod" },
      { exercise: "Tricep overhead", text: "27.5, 27.5" },
      { exercise: "Lateral raises", text: "55, 55" }
    ]},
    { date: "2026-04-25", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 45" },
      { exercise: "Pullup", text: "55 hard" },
      { exercise: "Lat pull down", text: "70, 85 - good" },
      { exercise: "Seated row", text: "70, 85" },
      { exercise: "Face pull", text: "35, 40" },
      { exercise: "Dumbbell curl", text: "40, 50 machine" }
    ]},
    { date: "2026-04-27", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", text: "25*2" },
      { exercise: "Dead lifts", text: "60*2, 60*2 focus on form" },
      { exercise: "Seated leg", text: "45*4, 45*6" },
      { exercise: "Seated leg curl", text: "70, 85" }
    ]},
    { date: "2026-04-30", routineId: "push", note: "12/10 sets", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "30, 30 bar each 6, 5" },
      { exercise: "Fly machine", text: "70, 85" },
      { exercise: "Shoulder press", text: "40, 40 got 8 doing 12, 10 sets" },
      { exercise: "Tricep pushdown", text: "27.5, 32.5 rod" },
      { exercise: "Tricep overhead", text: "27.5, 27.5" },
      { exercise: "Lateral raises", text: "55, 70 6 reps" }
    ]},
    { date: "2026-05-01", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 45" },
      { exercise: "Pullup", text: "55 hard 6,4 reps" },
      { exercise: "Lat pull down", text: "85, 85 - 10,10" },
      { exercise: "Seated row", text: "70, 85 12,10" },
      { exercise: "Face pull", text: "37.5, 42.5" },
      { exercise: "Dumbbell curl", text: "50, 65 machine 12,8 reps" }
    ]},
    { date: "2026-05-05", routineId: "leg", note: "Should do squats, dead lifts first", entries: [
      { exercise: "Squats", text: "25*2 12, 10" },
      { exercise: "Dead lifts", text: "60*2, 70*2 10,6" },
      { exercise: "Seated leg", text: "45*4, 45*6 10, 6" },
      { exercise: "Seated leg curl", text: "65, 80 - 12, 6" }
    ]},
    { date: "2026-05-13", routineId: "push", note: "12/10 sets", entries: [
      { exercise: "Bench", text: "25, 30 each" },
      { exercise: "Incline", text: "30, 30 bar" },
      { exercise: "Fly machine", text: "70, 85" },
      { exercise: "Shoulder press", text: "40, 40 got 8 doing 12, 10 sets" },
      { exercise: "Tricep pushdown", text: "27.5, 32.5 rod" },
      { exercise: "Tricep overhead", text: "27.5, 27.5" },
      { exercise: "Lateral raises", text: "55, 70 6 reps" }
    ]},
    { date: "2026-05-15", routineId: "pull", entries: [
      { exercise: "Pullup", text: "55 hard 6,4 reps" },
      { exercise: "Lat pull down", text: "85, 100 - 12, 6" },
      { exercise: "Seated row", text: "70, 85 14, 12" },
      { exercise: "Face pull", text: "40, 50" },
      { exercise: "Dumbbell curl", text: "65, 65 machine 10, 6 reps" }
    ]},
    { date: "2026-06-24", routineId: "push", note: "12/10 sets", entries: [
      { exercise: "Bench", text: "25, 25 each" },
      { exercise: "Incline", text: "25, 25 each machine" },
      { exercise: "Fly machine", text: "70, 70" },
      { exercise: "Shoulder press", text: "30, 30" },
      { exercise: "Tricep pushdown", text: "27.5, 27.5 rod - 8 sets" },
      { exercise: "Tricep overhead", text: "27.5, 22.5" },
      { exercise: "Lateral raises", text: "50, 50 reps" }
    ]},
    { date: "2026-06-25", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 42.5" },
      { exercise: "Pullup", text: "55 hard 6, 4 reps" },
      { exercise: "Lat pull down", text: "85, 100 - 10, 4" },
      { exercise: "Seated row", text: "70, 85 10, 10" },
      { exercise: "Face pull", text: "40, 40 8, 8" },
      { exercise: "Dumbbell curl", text: "65, 65 machine 8, 6 reps" }
    ]},
    { date: "2026-06-26", routineId: "leg", entries: [
      { exercise: "Squats", text: "Empty rod for form" },
      { exercise: "Dead lifts", text: "60*2, 60*2 6, 6" },
      { exercise: "Seated leg", text: "45*4, 45*4 6, 6" },
      { exercise: "Seated leg curl", text: "70, 85 - 10, 8" }
    ]},
    { date: "2026-07-07", routineId: "push", note: "10/8 sets", entries: [
      { exercise: "Bench", text: "25, 25 each" },
      { exercise: "Incline", text: "25, 30 each machine" },
      { exercise: "Fly machine", text: "70, 70" },
      { exercise: "Shoulder press", text: "30, 40" },
      { exercise: "Tricep pushdown", text: "27.5, 27.5 rod - 8 sets" },
      { exercise: "Tricep overhead", text: "27.5, 22.5" },
      { exercise: "Lateral raises", text: "50, 50 reps" }
    ]},
    { date: "2026-07-09", routineId: "pull", entries: [
      { exercise: "Bent over row", text: "40, 42.5" },
      { exercise: "Pullup", text: "55 hard 6, 4 reps" },
      { exercise: "Lat pull down", text: "85, 100 - 12, 10" },
      { exercise: "Seated row", text: "70, 85 10, 10" },
      { exercise: "Face pull", text: "40, 45 8, 6" },
      { exercise: "Dumbbell curl", text: "65, 65 machine 8, 6 reps" }
    ]}
  ].map(function (s, i) { return Object.assign({ id: "ss" + i }, s); })
};
