import { Activity, Dumbbell } from 'lucide-react';

export const routines = {
  'mens-chest': {
    title: 'Men\'s Chest & Triceps',
    icon: Dumbbell,
    desc: 'Build a strong and broad chest with tricep isolation.',
    exercises: [
      { name: 'Barbell Bench Press', posture: 'Keep feet flat, arch back slightly, grip wider than shoulders.', breathing: 'Inhale on the way down, exhale as you push up.', sets: 4, reps: '8-12' },
      { name: 'Incline Dumbbell Press', posture: 'Set bench to 30-45 degrees, keep chest up.', breathing: 'Inhale lowering dumbbells, exhale pressing up.', sets: 3, reps: '10-12' },
      { name: 'Cable Crossovers', posture: 'Slight bend in elbows, squeeze chest at the center.', breathing: 'Inhale opening arms, exhale bringing hands together.', sets: 3, reps: '12-15' },
      { name: 'Tricep Rope Pushdown', posture: 'Keep elbows tucked at your sides, back straight.', breathing: 'Exhale pushing down, inhale returning.', sets: 3, reps: '12-15' },
      { name: 'Overhead Tricep Extension', posture: 'Keep core tight, elbows pointing up.', breathing: 'Inhale lowering weight behind head, exhale extending up.', sets: 3, reps: '10-12' }
    ]
  },
  'mens-back': {
    title: 'Men\'s Back & Biceps',
    icon: Dumbbell,
    desc: 'Develop a wide V-taper and strong biceps.',
    exercises: [
      { name: 'Deadlifts', posture: 'Keep back straight, bar close to shins, hinge at hips.', breathing: 'Inhale down, exhale driving up.', sets: 4, reps: '5-8' },
      { name: 'Lat Pulldown', posture: 'Slight lean back, pull bar to upper chest.', breathing: 'Exhale pulling down, inhale letting it up.', sets: 3, reps: '10-12' },
      { name: 'Barbell Rows', posture: 'Torso at 45 degrees, pull bar to belly button.', breathing: 'Exhale pulling up, inhale lowering.', sets: 3, reps: '8-12' },
      { name: 'Barbell Bicep Curls', posture: 'Keep elbows pinned to sides, avoid swinging.', breathing: 'Exhale curling up, inhale lowering.', sets: 3, reps: '10-12' },
      { name: 'Hammer Curls', posture: 'Neutral grip, alternate arms.', breathing: 'Exhale curling, inhale lowering.', sets: 3, reps: '10-12' }
    ]
  },
  'mens-legs': {
    title: 'Men\'s Legs & Shoulders',
    icon: Dumbbell,
    desc: 'Intense lower body power and boulder shoulders.',
    exercises: [
      { name: 'Barbell Squats', posture: 'Chest up, break at hips, squat below parallel.', breathing: 'Inhale going down, exhale driving up.', sets: 4, reps: '8-10' },
      { name: 'Leg Press', posture: 'Feet shoulder-width, don\'t lock knees at top.', breathing: 'Inhale lowering, exhale pressing up.', sets: 3, reps: '10-15' },
      { name: 'Leg Extensions', posture: 'Squeeze quads at top of movement.', breathing: 'Exhale extending, inhale lowering.', sets: 3, reps: '12-15' },
      { name: 'Overhead Press', posture: 'Core braced, press bar straight up.', breathing: 'Exhale pressing, inhale lowering.', sets: 4, reps: '8-10' },
      { name: 'Lateral Raises', posture: 'Slight bend in elbows, lift to shoulder height.', breathing: 'Exhale lifting, inhale lowering.', sets: 3, reps: '15' }
    ]
  },
  'womens-lower': {
    title: 'Women\'s Glutes & Legs',
    icon: Activity,
    desc: 'Build strong glutes and toned legs with targeted movements.',
    exercises: [
      { name: 'Barbell Hip Thrusts', posture: 'Shoulder blades on bench, drive through heels.', breathing: 'Exhale pushing up, inhale lowering.', sets: 4, reps: '10-12' },
      { name: 'Romanian Deadlifts', posture: 'Hinge at hips, keep back straight, slight bend in knees.', breathing: 'Inhale lowering, exhale squeezing glutes at top.', sets: 4, reps: '10-12' },
      { name: 'Bulgarian Split Squats', posture: 'Keep torso upright for quads, lean forward for glutes.', breathing: 'Inhale down, exhale up.', sets: 3, reps: '10-12' },
      { name: 'Leg Curl', posture: 'Control the negative, squeeze hamstrings.', breathing: 'Exhale curling, inhale releasing.', sets: 3, reps: '12-15' },
      { name: 'Cable Kickbacks', posture: 'Keep core tight, squeeze glute at the top.', breathing: 'Exhale kicking back, inhale returning.', sets: 3, reps: '15' }
    ]
  },
  'womens-upper': {
    title: 'Women\'s Upper & Core',
    icon: Activity,
    desc: 'Sculpt your arms, back, and core for a toned look.',
    exercises: [
      { name: 'Dumbbell Shoulder Press', posture: 'Keep back against bench, don\'t arch excessively.', breathing: 'Exhale pressing up, inhale lowering.', sets: 3, reps: '10-12' },
      { name: 'Lat Pulldown', posture: 'Pull to upper chest, squeeze shoulder blades.', breathing: 'Exhale pulling down, inhale up.', sets: 3, reps: '12-15' },
      { name: 'Dumbbell Rows', posture: 'Supported on bench, pull elbow to hip.', breathing: 'Exhale pulling up, inhale lowering.', sets: 3, reps: '12-15' },
      { name: 'Plank', posture: 'Body in a straight line, core braced.', breathing: 'Breathe normally, do not hold breath.', sets: 3, reps: '60s' },
      { name: 'Russian Twists', posture: 'Lean back slightly, rotate torso completely.', breathing: 'Exhale twisting, inhale center.', sets: 3, reps: '20' }
    ]
  },
  'womens-full': {
    title: 'Women\'s Full Body Tone',
    icon: Activity,
    desc: 'High-intensity resistance training for total body conditioning.',
    exercises: [
      { name: 'Goblet Squats', posture: 'Hold dumbbell at chest level, keep chest up, squat below parallel.', breathing: 'Inhale going down, exhale driving up.', sets: 4, reps: '12-15' },
      { name: 'Walking Lunges', posture: 'Keep chest up, back knee almost touching floor.', breathing: 'Inhale stepping, exhale pushing up.', sets: 3, reps: '12 per leg' },
      { name: 'Push-ups', posture: 'Keep core tight, elbows tucked slightly.', breathing: 'Inhale down, exhale up.', sets: 3, reps: 'AMRAP' },
      { name: 'Dumbbell Curl to Press', posture: 'Curl weights, then press overhead.', breathing: 'Exhale pressing, inhale lowering.', sets: 3, reps: '10-12' },
      { name: 'Bicycle Crunches', posture: 'Elbow to opposite knee, slow and controlled.', breathing: 'Exhale crunching, inhale extending.', sets: 3, reps: '20' }
    ]
  }
};
