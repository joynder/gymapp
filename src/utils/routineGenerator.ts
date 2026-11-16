import { EXERCISES_DATABASE } from '../data/exercises';
import type {
  EquipmentId,
  Exercise,
  GoalType,
  LifestyleType,
  PlannedExercise,
  Routine,
  RoutineDay,
  SplitType,
  UserPreferences,
} from '../types';

export function isExerciseAvailable(
  exercise: Exercise,
  availableEquipment: EquipmentId[]
): boolean {
  if (exercise.requiredEquipment.length === 0) return true;
  return exercise.requiredEquipment.every((eq) =>
    availableEquipment.includes(eq)
  );
}

export function getFeasibleExercises(
  availableEquipment: EquipmentId[]
): Exercise[] {
  return EXERCISES_DATABASE.filter((ex) =>
    isExerciseAvailable(ex, availableEquipment)
  );
}

/**
 * Calculates adaptive sets, reps, and recovery time based on Goal and Lifestyle
 */
export function getRepsAndRestForGoalAndLifestyle(
  exercise: Exercise,
  goal: GoalType,
  lifestyle: LifestyleType
): { sets: number; reps: string; restSeconds: number } {
  const isCompound = exercise.category === 'Composto';

  let sets = 3;
  let reps = '8-10';
  let restSeconds = 90;

  // 1. Goal modulation
  if (goal === 'forza') {
    sets = isCompound ? 4 : 3;
    reps = isCompound ? '4-6' : '6-8';
    restSeconds = isCompound ? 150 : 90;
  } else if (goal === 'dimagrimento') {
    sets = 3;
    reps = isCompound ? '10-12' : '12-15';
    restSeconds = isCompound ? 60 : 45;
  } else if (goal === 'mantenimento') {
    sets = isCompound ? 3 : 2;
    reps = '8-10';
    restSeconds = 75;
  } else if (goal === 'ricomposizione') {
    sets = 3;
    reps = isCompound ? '6-8' : '10-12';
    restSeconds = isCompound ? 90 : 60;
  } else {
    // ipertrofia (default)
    sets = isCompound ? 4 : 3;
    reps = isCompound ? '8-10' : '10-12';
    restSeconds = isCompound ? 90 : 60;
  }

  // 2. Lifestyle recovery modulation
  if (lifestyle === 'sedentario') {
    // Sedentary individuals need slightly longer recovery between heavy compound sets for CNS recovery
    if (isCompound) restSeconds += 15;
  } else if (lifestyle === 'attivo') {
    // Very active individuals have higher cardiovascular efficiency, keep density high
    if (restSeconds > 60 && goal !== 'forza') {
      restSeconds = Math.max(45, restSeconds - 15);
    }
  }

  return { sets, reps, restSeconds };
}

/**
 * Computes suggested starting base weight based on body weight, experience level, and exercise coefficient
 */
export function calculateBaseWeight(
  exercise: Exercise,
  bodyWeightKg: number,
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzato',
  goal: GoalType
): number {
  if (exercise.isBodyweight) {
    return 0; // Esercizio a corpo libero puro
  }

  const levelKey =
    experienceLevel === 'Principiante'
      ? 'principiante'
      : experienceLevel === 'Intermedio'
      ? 'intermedio'
      : 'avanzato';

  const multiplier = exercise.bodyWeightMultiplier[levelKey] || 0.4;
  let estimatedWeight = bodyWeightKg * multiplier;

  // Fine adjust for goal
  if (goal === 'forza') {
    estimatedWeight *= 1.1; // heavier for low reps
  } else if (goal === 'dimagrimento') {
    estimatedWeight *= 0.85; // lighter for higher reps
  }

  // Round to nearest 2.5 kg or 1 kg
  if (estimatedWeight > 20) {
    return Math.round(estimatedWeight / 2.5) * 2.5;
  }
  return Math.round(estimatedWeight * 2) / 2;
}

export function generateRoutine(preferences: UserPreferences): Routine {
  const available = getFeasibleExercises(preferences.availableEquipment);
  const preferredIds = preferences.preferredExerciseIds || [];
  const { splitType, goal, lifestyle, bodyWeightKg, experienceLevel } = preferences;

  const days: RoutineDay[] = [];

  const createPlannedEx = (ex: Exercise): PlannedExercise => {
    const params = getRepsAndRestForGoalAndLifestyle(ex, goal, lifestyle);
    const targetWeightKg = calculateBaseWeight(ex, bodyWeightKg, experienceLevel, goal);

    return {
      exerciseId: ex.id,
      sets: params.sets,
      reps: params.reps,
      targetWeightKg,
      isBodyweight: ex.isBodyweight || false,
      restSeconds: params.restSeconds,
    };
  };

  const selectForGroup = (
    muscles: string[],
    maxExercises: number,
    dayUsedIds: Set<string>
  ): PlannedExercise[] => {
    const candidates = available.filter(
      (ex) => muscles.includes(ex.musclePrimary) && !dayUsedIds.has(ex.id)
    );

    // Sort by preferred, then compound
    candidates.sort((a, b) => {
      const aPref = preferredIds.includes(a.id) ? 1 : 0;
      const bPref = preferredIds.includes(b.id) ? 1 : 0;
      if (aPref !== bPref) return bPref - aPref;

      const aComp = a.category === 'Composto' ? 1 : 0;
      const bComp = b.category === 'Composto' ? 1 : 0;
      return bComp - aComp;
    });

    const chosen = candidates.slice(0, maxExercises);
    chosen.forEach((ex) => dayUsedIds.add(ex.id));
    return chosen.map(createPlannedEx);
  };

  if (splitType === 'push_pull_legs') {
    // Day 1: Push
    const pushUsed = new Set<string>();
    days.push({
      id: 'day-push',
      dayName: 'Giorno A - Spinta (Push)',
      focus: 'Petto, Spalle Anteriori e Laterali, Tricipiti',
      exercises: [
        ...selectForGroup(['Petto'], 3, pushUsed),
        ...selectForGroup(['Spalle'], 2, pushUsed),
        ...selectForGroup(['Tricipiti'], 2, pushUsed),
      ],
    });

    // Day 2: Pull
    const pullUsed = new Set<string>();
    days.push({
      id: 'day-pull',
      dayName: 'Giorno B - Tirata (Pull)',
      focus: 'Dorso, Deltoidi Posteriori, Bicipiti, Addome',
      exercises: [
        ...selectForGroup(['Dorso'], 3, pullUsed),
        ...selectForGroup(['Bicipiti'], 2, pullUsed),
        ...selectForGroup(['Spalle'], 1, pullUsed),
        ...selectForGroup(['Addome'], 1, pullUsed),
      ],
    });

    // Day 3: Legs
    const legUsed = new Set<string>();
    days.push({
      id: 'day-legs',
      dayName: 'Giorno C - Gambe (Legs)',
      focus: 'Quadricipiti, Femorali, Glutei, Core',
      exercises: [
        ...selectForGroup(['Quadricipiti'], 2, legUsed),
        ...selectForGroup(['Femorali'], 2, legUsed),
        ...selectForGroup(['Glutei'], 1, legUsed),
        ...selectForGroup(['Polpacci'], 1, legUsed),
        ...selectForGroup(['Addome'], 1, legUsed),
      ],
    });
  } else if (splitType === 'upper_lower') {
    const uA = new Set<string>();
    days.push({
      id: 'day-upper-a',
      dayName: 'Giorno 1 - Parte Superiore (A)',
      focus: 'Petto, Dorso, Spalle, Braccia',
      exercises: [
        ...selectForGroup(['Petto'], 2, uA),
        ...selectForGroup(['Dorso'], 2, uA),
        ...selectForGroup(['Spalle'], 1, uA),
        ...selectForGroup(['Bicipiti'], 1, uA),
        ...selectForGroup(['Tricipiti'], 1, uA),
      ],
    });

    const lA = new Set<string>();
    days.push({
      id: 'day-lower-a',
      dayName: 'Giorno 2 - Parte Inferiore (A)',
      focus: 'Quadricipiti, Femorali, Glutei, Addome',
      exercises: [
        ...selectForGroup(['Quadricipiti'], 2, lA),
        ...selectForGroup(['Femorali'], 2, lA),
        ...selectForGroup(['Polpacci'], 1, lA),
        ...selectForGroup(['Addome'], 1, lA),
      ],
    });

    const uB = new Set<string>();
    days.push({
      id: 'day-upper-b',
      dayName: 'Giorno 3 - Parte Superiore (B)',
      focus: 'Dorso, Petto, Deltoidi, Braccia',
      exercises: [
        ...selectForGroup(['Dorso'], 2, uB),
        ...selectForGroup(['Petto'], 2, uB),
        ...selectForGroup(['Spalle'], 2, uB),
        ...selectForGroup(['Tricipiti'], 1, uB),
        ...selectForGroup(['Bicipiti'], 1, uB),
      ],
    });

    const lB = new Set<string>();
    days.push({
      id: 'day-lower-b',
      dayName: 'Giorno 4 - Parte Inferiore (B)',
      focus: 'Femorali, Stacco, Quadricipiti, Addome',
      exercises: [
        ...selectForGroup(['Femorali'], 2, lB),
        ...selectForGroup(['Quadricipiti'], 2, lB),
        ...selectForGroup(['Polpacci'], 1, lB),
        ...selectForGroup(['Addome'], 1, lB),
      ],
    });
  } else if (splitType === 'monofrequenza') {
    const d1 = new Set<string>();
    days.push({
      id: 'day-chest-tri',
      dayName: 'Giorno 1 - Petto e Tricipiti',
      focus: 'Pettorali completi e Tricipiti',
      exercises: [
        ...selectForGroup(['Petto'], 4, d1),
        ...selectForGroup(['Tricipiti'], 3, d1),
      ],
    });

    const d2 = new Set<string>();
    days.push({
      id: 'day-back-bi',
      dayName: 'Giorno 2 - Dorso e Bicipiti',
      focus: 'Spessore, Ampiezza e Flessori del braccio',
      exercises: [
        ...selectForGroup(['Dorso'], 4, d2),
        ...selectForGroup(['Bicipiti'], 3, d2),
      ],
    });

    const d3 = new Set<string>();
    days.push({
      id: 'day-shoulders-abs',
      dayName: 'Giorno 3 - Spalle e Addome',
      focus: 'Deltoidi 3D e Stabilità Core',
      exercises: [
        ...selectForGroup(['Spalle'], 4, d3),
        ...selectForGroup(['Addome'], 2, d3),
      ],
    });

    const d4 = new Set<string>();
    days.push({
      id: 'day-legs-mono',
      dayName: 'Giorno 4 - Gambe Complete',
      focus: 'Quadricipiti, Femorali, Glutei e Polpacci',
      exercises: [
        ...selectForGroup(['Quadricipiti'], 3, d4),
        ...selectForGroup(['Femorali'], 2, d4),
        ...selectForGroup(['Polpacci'], 1, d4),
      ],
    });
  } else {
    // Full Body
    const count = preferences.frequencyDays || 3;
    for (let i = 1; i <= Math.min(count, 3); i++) {
      const fb = new Set<string>();
      days.push({
        id: `day-fb-${i}`,
        dayName: `Giorno ${i} - Full Body`,
        focus: 'Stimolo su tutti i distretti muscolari',
        exercises: [
          ...selectForGroup(['Quadricipiti', 'Femorali'], 2, fb),
          ...selectForGroup(['Petto'], 1, fb),
          ...selectForGroup(['Dorso'], 1, fb),
          ...selectForGroup(['Spalle'], 1, fb),
          ...selectForGroup(i % 2 === 1 ? ['Bicipiti'] : ['Tricipiti'], 1, fb),
          ...selectForGroup(['Addome'], 1, fb),
        ],
      });
    }
  }

  // Fallback
  days.forEach((day) => {
    if (day.exercises.length === 0 && available.length > 0) {
      day.exercises = available.slice(0, 4).map(createPlannedEx);
    }
  });

  const titles: Record<SplitType, string> = {
    push_pull_legs: 'Scheda Push / Pull / Legs',
    upper_lower: 'Scheda Upper / Lower (4 Giorni)',
    monofrequenza: 'Scheda Monofrequenza (4 Split)',
    full_body: `Scheda Full Body (${days.length} Giorni)`,
  };

  return {
    id: 'routine_' + Date.now(),
    title: titles[splitType],
    createdAt: new Date().toISOString(),
    splitType,
    goal,
    lifestyle,
    bodyWeightKg,
    days,
  };
}
