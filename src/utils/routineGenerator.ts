import { EXERCISES_DATABASE } from '../data/exercises';
import type {
  EquipmentId,
  Exercise,
  GoalType,
  LifestyleType,
  PlannedExercise,
  Routine,
  RoutineDay,
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
    if (isCompound) restSeconds += 15;
  } else if (lifestyle === 'attivo') {
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
    return 0; // Corpo libero puro
  }

  const levelKey =
    experienceLevel === 'Principiante'
      ? 'principiante'
      : experienceLevel === 'Intermedio'
      ? 'intermedio'
      : 'avanzato';

  let multiplier = exercise.bodyWeightMultiplier[levelKey] || 0.4;

  if (goal === 'forza') multiplier *= 1.1;
  else if (goal === 'dimagrimento') multiplier *= 0.9;

  const rawWeight = bodyWeightKg * multiplier;
  // Round to nearest 2.5 kg
  const rounded = Math.round(rawWeight / 2.5) * 2.5;
  return Math.max(2.5, rounded);
}

/**
 * Main routine generation strictly adhering to selected frequency (days) and target duration
 */
export function generateRoutine(preferences: UserPreferences): Routine {
  const available = getFeasibleExercises(preferences.availableEquipment);
  const preferredIds = preferences.preferredExerciseIds || [];
  const { splitType, goal, lifestyle, bodyWeightKg, experienceLevel } = preferences;

  const frequencyDays = Math.max(2, Math.min(6, preferences.frequencyDays || 3));
  const targetDuration = preferences.workoutDurationMinutes || 60;

  // Exercise count scaling based on target duration (minutes)
  // 30 min: ~3-4 exercises
  // 45 min: ~4-5 exercises
  // 60 min: ~6-7 exercises
  // 75 min: ~7-8 exercises
  // 90 min: ~8-9 exercises
  let targetExercisesPerDay = 6;
  if (targetDuration <= 35) {
    targetExercisesPerDay = 3;
  } else if (targetDuration <= 50) {
    targetExercisesPerDay = 4;
  } else if (targetDuration <= 65) {
    targetExercisesPerDay = 6;
  } else if (targetDuration <= 80) {
    targetExercisesPerDay = 7;
  } else {
    targetExercisesPerDay = 8;
  }

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
    if (maxExercises <= 0) return [];

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

  // Helper to distribute total exercises over specific target muscle buckets
  const buildDayExercises = (
    buckets: { muscles: string[]; ratio: number }[],
    totalCount: number
  ): PlannedExercise[] => {
    const dayUsed = new Set<string>();
    const exercises: PlannedExercise[] = [];

    // Calculate slots per bucket
    let allocated = 0;
    const bucketAllocations = buckets.map((b, idx) => {
      if (idx === buckets.length - 1) {
        return Math.max(1, totalCount - allocated);
      }
      const count = Math.max(1, Math.round(totalCount * b.ratio));
      allocated += count;
      return count;
    });

    buckets.forEach((bucket, idx) => {
      const limit = bucketAllocations[idx];
      const selected = selectForGroup(bucket.muscles, limit, dayUsed);
      exercises.push(...selected);
    });

    return exercises;
  };

  const days: RoutineDay[] = [];

  // ==========================================
  // 2 DAYS SPLIT
  // ==========================================
  if (frequencyDays === 2) {
    // Day 1: Upper Body / Push & Pull
    days.push({
      id: 'day-1',
      dayName: 'Giorno 1 - Parte Superiore (Upper Body)',
      focus: 'Petto, Dorso, Spalle e Braccia',
      exercises: buildDayExercises(
        [
          { muscles: ['Petto'], ratio: 0.3 },
          { muscles: ['Dorso'], ratio: 0.3 },
          { muscles: ['Spalle'], ratio: 0.2 },
          { muscles: ['Bicipiti', 'Tricipiti'], ratio: 0.2 },
        ],
        targetExercisesPerDay
      ),
    });

    // Day 2: Lower Body / Legs & Core
    days.push({
      id: 'day-2',
      dayName: 'Giorno 2 - Parte Inferiore (Lower Body & Core)',
      focus: 'Quadricipiti, Femorali, Glutei, Polpacci e Addome',
      exercises: buildDayExercises(
        [
          { muscles: ['Quadricipiti'], ratio: 0.35 },
          { muscles: ['Femorali', 'Glutei'], ratio: 0.35 },
          { muscles: ['Polpacci'], ratio: 0.15 },
          { muscles: ['Addome'], ratio: 0.15 },
        ],
        targetExercisesPerDay
      ),
    });
  }

  // ==========================================
  // 3 DAYS SPLIT
  // ==========================================
  else if (frequencyDays === 3) {
    if (splitType === 'full_body') {
      days.push({
        id: 'day-1',
        dayName: 'Giorno 1 - Full Body A (Focus Spinta)',
        focus: 'Petto, Quadricipiti, Dorso, Braccia',
        exercises: buildDayExercises(
          [
            { muscles: ['Petto'], ratio: 0.3 },
            { muscles: ['Quadricipiti'], ratio: 0.3 },
            { muscles: ['Dorso'], ratio: 0.25 },
            { muscles: ['Tricipiti', 'Addome'], ratio: 0.15 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-2',
        dayName: 'Giorno 2 - Full Body B (Focus Tirata & Catena Posteriore)',
        focus: 'Dorso, Femorali/Glutei, Spalle, Bicipiti',
        exercises: buildDayExercises(
          [
            { muscles: ['Dorso'], ratio: 0.3 },
            { muscles: ['Femorali', 'Glutei'], ratio: 0.3 },
            { muscles: ['Spalle'], ratio: 0.25 },
            { muscles: ['Bicipiti'], ratio: 0.15 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-3',
        dayName: 'Giorno 3 - Full Body C (Focus Ipertrofia Globale)',
        focus: 'Gambe complete, Spalle, Petto, Core',
        exercises: buildDayExercises(
          [
            { muscles: ['Quadricipiti', 'Femorali'], ratio: 0.35 },
            { muscles: ['Petto', 'Dorso'], ratio: 0.35 },
            { muscles: ['Spalle', 'Addome'], ratio: 0.3 },
          ],
          targetExercisesPerDay
        ),
      });
    } else {
      // Classic Push / Pull / Legs (default for 3 days)
      days.push({
        id: 'day-1',
        dayName: 'Giorno A - Spinta (Push)',
        focus: 'Petto, Deltoidi Anteriori/Laterali e Tricipiti',
        exercises: buildDayExercises(
          [
            { muscles: ['Petto'], ratio: 0.45 },
            { muscles: ['Spalle'], ratio: 0.3 },
            { muscles: ['Tricipiti'], ratio: 0.25 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-2',
        dayName: 'Giorno B - Tirata (Pull)',
        focus: 'Dorso, Deltoidi Posteriori, Bicipiti e Addome',
        exercises: buildDayExercises(
          [
            { muscles: ['Dorso'], ratio: 0.45 },
            { muscles: ['Bicipiti'], ratio: 0.25 },
            { muscles: ['Spalle'], ratio: 0.15 },
            { muscles: ['Addome'], ratio: 0.15 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-3',
        dayName: 'Giorno C - Gambe (Legs)',
        focus: 'Quadricipiti, Femorali, Glutei, Polpacci e Core',
        exercises: buildDayExercises(
          [
            { muscles: ['Quadricipiti'], ratio: 0.35 },
            { muscles: ['Femorali', 'Glutei'], ratio: 0.35 },
            { muscles: ['Polpacci'], ratio: 0.15 },
            { muscles: ['Addome'], ratio: 0.15 },
          ],
          targetExercisesPerDay
        ),
      });
    }
  }

  // ==========================================
  // 4 DAYS SPLIT
  // ==========================================
  else if (frequencyDays === 4) {
    // Upper / Lower Split A & B
    days.push({
      id: 'day-1',
      dayName: 'Giorno 1 - Parte Superiore A (Upper A)',
      focus: 'Petto pesante, Dorso, Spalle e Braccia',
      exercises: buildDayExercises(
        [
          { muscles: ['Petto'], ratio: 0.35 },
          { muscles: ['Dorso'], ratio: 0.3 },
          { muscles: ['Spalle'], ratio: 0.2 },
          { muscles: ['Tricipiti'], ratio: 0.15 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-2',
      dayName: 'Giorno 2 - Parte Inferiore A (Lower A)',
      focus: 'Quadricipiti prioritari, Femorali, Polpacci e Addome',
      exercises: buildDayExercises(
        [
          { muscles: ['Quadricipiti'], ratio: 0.4 },
          { muscles: ['Femorali', 'Glutei'], ratio: 0.3 },
          { muscles: ['Polpacci'], ratio: 0.15 },
          { muscles: ['Addome'], ratio: 0.15 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-3',
      dayName: 'Giorno 3 - Parte Superiore B (Upper B)',
      focus: 'Dorso pesante, Petto inclinato, Deltoidi e Bicipiti',
      exercises: buildDayExercises(
        [
          { muscles: ['Dorso'], ratio: 0.35 },
          { muscles: ['Petto'], ratio: 0.3 },
          { muscles: ['Spalle'], ratio: 0.2 },
          { muscles: ['Bicipiti'], ratio: 0.15 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-4',
      dayName: 'Giorno 4 - Parte Inferiore B (Lower B)',
      focus: 'Catena Posteriore, Stacchi, Glutei e Core',
      exercises: buildDayExercises(
        [
          { muscles: ['Femorali', 'Glutei'], ratio: 0.45 },
          { muscles: ['Quadricipiti'], ratio: 0.25 },
          { muscles: ['Polpacci'], ratio: 0.15 },
          { muscles: ['Addome'], ratio: 0.15 },
        ],
        targetExercisesPerDay
      ),
    });
  }

  // ==========================================
  // 5 DAYS SPLIT
  // ==========================================
  else if (frequencyDays === 5) {
    if (splitType === 'monofrequenza') {
      days.push({
        id: 'day-1',
        dayName: 'Giorno 1 - Petto & Addome',
        focus: 'Panca, Distensioni, Croci e Core',
        exercises: buildDayExercises(
          [
            { muscles: ['Petto'], ratio: 0.75 },
            { muscles: ['Addome'], ratio: 0.25 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-2',
        dayName: 'Giorno 2 - Dorso & Deltoidi Posteriori',
        focus: 'Trazioni, Rematori e Pulley',
        exercises: buildDayExercises(
          [
            { muscles: ['Dorso'], ratio: 0.75 },
            { muscles: ['Spalle'], ratio: 0.25 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-3',
        dayName: 'Giorno 3 - Gambe Complete',
        focus: 'Squat, Pressa, Femorali e Polpacci',
        exercises: buildDayExercises(
          [
            { muscles: ['Quadricipiti'], ratio: 0.4 },
            { muscles: ['Femorali', 'Glutei'], ratio: 0.4 },
            { muscles: ['Polpacci'], ratio: 0.2 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-4',
        dayName: 'Giorno 4 - Spalle & Trapezi',
        focus: 'Military Press, Alzate Laterali e Posteriori',
        exercises: buildDayExercises(
          [
            { muscles: ['Spalle'], ratio: 0.8 },
            { muscles: ['Addome'], ratio: 0.2 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-5',
        dayName: 'Giorno 5 - Braccia (Bicipiti & Tricipiti)',
        focus: 'Super serie Braccia e Isolamento',
        exercises: buildDayExercises(
          [
            { muscles: ['Bicipiti'], ratio: 0.5 },
            { muscles: ['Tricipiti'], ratio: 0.5 },
          ],
          targetExercisesPerDay
        ),
      });
    } else {
      // Push / Pull / Legs / Upper / Lower (Best 5-day hybrid)
      days.push({
        id: 'day-1',
        dayName: 'Giorno 1 - Spinta (Push)',
        focus: 'Petto, Spalle Anteriori e Tricipiti',
        exercises: buildDayExercises(
          [
            { muscles: ['Petto'], ratio: 0.45 },
            { muscles: ['Spalle'], ratio: 0.3 },
            { muscles: ['Tricipiti'], ratio: 0.25 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-2',
        dayName: 'Giorno 2 - Tirata (Pull)',
        focus: 'Dorso, Deltoidi Posteriori e Bicipiti',
        exercises: buildDayExercises(
          [
            { muscles: ['Dorso'], ratio: 0.5 },
            { muscles: ['Bicipiti'], ratio: 0.3 },
            { muscles: ['Spalle'], ratio: 0.2 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-3',
        dayName: 'Giorno 3 - Gambe (Legs)',
        focus: 'Quadricipiti, Femorali, Glutei e Polpacci',
        exercises: buildDayExercises(
          [
            { muscles: ['Quadricipiti'], ratio: 0.4 },
            { muscles: ['Femorali', 'Glutei'], ratio: 0.4 },
            { muscles: ['Polpacci'], ratio: 0.2 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-4',
        dayName: 'Giorno 4 - Parte Superiore (Upper Body)',
        focus: 'Petto, Dorso, Spalle e Braccia',
        exercises: buildDayExercises(
          [
            { muscles: ['Petto'], ratio: 0.3 },
            { muscles: ['Dorso'], ratio: 0.3 },
            { muscles: ['Spalle'], ratio: 0.2 },
            { muscles: ['Bicipiti', 'Tricipiti'], ratio: 0.2 },
          ],
          targetExercisesPerDay
        ),
      });

      days.push({
        id: 'day-5',
        dayName: 'Giorno 5 - Parte Inferiore & Core (Lower & Abs)',
        focus: 'Squat, Catena Posteriore e Addominali',
        exercises: buildDayExercises(
          [
            { muscles: ['Quadricipiti'], ratio: 0.35 },
            { muscles: ['Femorali', 'Glutei'], ratio: 0.35 },
            { muscles: ['Addome'], ratio: 0.3 },
          ],
          targetExercisesPerDay
        ),
      });
    }
  }

  // ==========================================
  // 6 DAYS SPLIT (Push / Pull / Legs x 2)
  // ==========================================
  else if (frequencyDays === 6) {
    days.push({
      id: 'day-1',
      dayName: 'Giorno 1 - Push A (Forza & Panca)',
      focus: 'Petto pesante, Spalle e Tricipiti',
      exercises: buildDayExercises(
        [
          { muscles: ['Petto'], ratio: 0.45 },
          { muscles: ['Spalle'], ratio: 0.3 },
          { muscles: ['Tricipiti'], ratio: 0.25 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-2',
      dayName: 'Giorno 2 - Pull A (Spessore & Trazioni)',
      focus: 'Dorso pesante, Deltoidi Posteriori e Bicipiti',
      exercises: buildDayExercises(
        [
          { muscles: ['Dorso'], ratio: 0.5 },
          { muscles: ['Bicipiti'], ratio: 0.3 },
          { muscles: ['Spalle'], ratio: 0.2 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-3',
      dayName: 'Giorno 3 - Legs A (Quad Focus)',
      focus: 'Squat pesante, Pressa, Femorali e Polpacci',
      exercises: buildDayExercises(
        [
          { muscles: ['Quadricipiti'], ratio: 0.45 },
          { muscles: ['Femorali', 'Glutei'], ratio: 0.35 },
          { muscles: ['Polpacci'], ratio: 0.2 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-4',
      dayName: 'Giorno 4 - Push B (Ipertrofia & Spalle)',
      focus: 'Spalle pesanti, Panca inclinata, Cavi e Tricipiti',
      exercises: buildDayExercises(
        [
          { muscles: ['Spalle'], ratio: 0.4 },
          { muscles: ['Petto'], ratio: 0.35 },
          { muscles: ['Tricipiti'], ratio: 0.25 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-5',
      dayName: 'Giorno 5 - Pull B (Ampiezza & Braccia)',
      focus: 'Lat Machine, Pulley, Isolamento e Bicipiti',
      exercises: buildDayExercises(
        [
          { muscles: ['Dorso'], ratio: 0.45 },
          { muscles: ['Bicipiti'], ratio: 0.35 },
          { muscles: ['Addome'], ratio: 0.2 },
        ],
        targetExercisesPerDay
      ),
    });

    days.push({
      id: 'day-6',
      dayName: 'Giorno 6 - Legs B (Hamstrings & Glute Focus)',
      focus: 'Stacchi, Affondi, Hip Thrust e Core',
      exercises: buildDayExercises(
        [
          { muscles: ['Femorali', 'Glutei'], ratio: 0.5 },
          { muscles: ['Quadricipiti'], ratio: 0.3 },
          { muscles: ['Addome'], ratio: 0.2 },
        ],
        targetExercisesPerDay
      ),
    });
  }

  return {
    id: 'routine_' + Date.now(),
    title: `Scheda ${frequencyDays} Giorni - ${splitType.replace('_', ' ').toUpperCase()} (${targetDuration} min)`,
    createdAt: new Date().toISOString(),
    splitType,
    goal,
    lifestyle,
    bodyWeightKg,
    days,
  };
}
