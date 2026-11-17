export type MuscleGroup =
  | 'Petto'
  | 'Dorso'
  | 'Spalle'
  | 'Bicipiti'
  | 'Tricipiti'
  | 'Quadricipiti'
  | 'Femorali'
  | 'Glutei'
  | 'Polpacci'
  | 'Addome';

export type EquipmentId =
  | 'barbell'
  | 'dumbbells'
  | 'bench'
  | 'rack'
  | 'pullup_bar'
  | 'dip_station'
  | 'cables'
  | 'lat_machine'
  | 'low_row'
  | 'leg_extension'
  | 'leg_curl'
  | 'leg_press'
  | 'smith_machine'
  | 'pec_deck'
  | 'shoulder_press_machine'
  | 'calf_machine'
  | 'bodyweight'
  | 'resistance_bands'
  | 'kettlebell'
  | 'ez_bar'
  | 'preacher_curl_bench'
  | 'hack_squat_machine'
  | 't_bar_machine'
  | 'ab_wheel'
  | 'hip_thrust_bench'
  | 'chest_press_machine'
  | 'incline_chest_press_machine'
  | 'abductor_machine'
  | 'adductor_machine'
  | 'reverse_pec_deck'
  | 'hyperextension_bench'
  | 'assisted_pullup_dip'
  | 'seated_calf_machine';

export interface Equipment {
  id: EquipmentId;
  name: string;
  category: 'Pesi Liberi' | 'Macchinari' | 'Cavi' | 'Strutture' | 'Base';
  description: string;
}

export type ExerciseDiagramType =
  | 'bench_press'
  | 'incline_bench'
  | 'pushup'
  | 'squat'
  | 'deadlift'
  | 'overhead_press'
  | 'pullup'
  | 'lat_pulldown'
  | 'row'
  | 'seated_cable_row'
  | 'bicep_curl'
  | 'hammer_curl'
  | 'tricep_pushdown'
  | 'french_press'
  | 'dip'
  | 'lateral_raise'
  | 'face_pull'
  | 'leg_extension'
  | 'leg_curl'
  | 'leg_press'
  | 'lunges'
  | 'calf_raise'
  | 'plank'
  | 'cable_crunch'
  | 'hanging_leg_raise'
  | 'generic';

export interface StrengthStandardsRatio {
  beginner: number; // coefficiente moltiplicatore peso o reps se a corpo libero
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

export interface Exercise {
  id: string;
  name: string;
  musclePrimary: MuscleGroup;
  musclesSecondary: MuscleGroup[];
  requiredEquipment: EquipmentId[];
  category: 'Composto' | 'Isolamento';
  difficulty: 'Base' | 'Intermedio' | 'Avanzato';
  description: string;
  executionSteps: string[];
  commonMistakes: string[];
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  diagramType: ExerciseDiagramType;
  imageUrl: string; // Immagine ufficiale da StrengthLevel.com
  isBodyweight?: boolean;
  strengthStandards: StrengthStandardsRatio;
  bodyWeightMultiplier: {
    principiante: number;
    intermedio: number;
    avanzato: number;
  };
}

export type SplitType =
  | 'full_body'
  | 'push_pull_legs'
  | 'upper_lower'
  | 'monofrequenza';

export type GoalType =
  | 'ipertrofia'
  | 'forza'
  | 'dimagrimento'
  | 'mantenimento'
  | 'ricomposizione';

export type LifestyleType =
  | 'sedentario'
  | 'moderato'
  | 'attivo';

export type ThemeColor = 'orange' | 'green' | 'pink' | 'blue';

export interface UserPreferences {
  availableEquipment: EquipmentId[];
  preferredExerciseIds: string[];
  frequencyDays: number;
  splitType: SplitType;
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzato';
  bodyWeightKg: number;
  goal: GoalType;
  lifestyle: LifestyleType;
  workoutDurationMinutes?: number; // Durata desiderata sessione (30, 45, 60, 75, 90 min)
  themeColor?: ThemeColor;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  targetWeightKg: number;
  isBodyweight?: boolean;
  restSeconds: number;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  dayName: string;
  focus: string;
  exercises: PlannedExercise[];
}

export interface Routine {
  id: string;
  title: string;
  createdAt: string;
  splitType: SplitType;
  goal: GoalType;
  lifestyle: LifestyleType;
  bodyWeightKg: number;
  days: RoutineDay[];
}

export interface SetLog {
  setNumber: number;
  weightKg: number;
  isBodyweight?: boolean;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  isBodyweight?: boolean;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  dayId?: string;
  dayName: string;
  date: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  totalVolumeKg: number;
  sessionNotes?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  createdAt: string;
  preferences: UserPreferences;
  routine: Routine | null;
  sessions: WorkoutSession[];
}

export interface AppDatabase {
  activeUserId: string | null;
  users: Record<string, UserAccount>;
}

export interface OngoingWorkoutState {
  routineId?: string;
  dayId: string;
  dayIndex: number;
  dayName: string;
  startedAt: string;
  elapsedSeconds: number;
  exerciseLogs: ExerciseLog[];
}
