export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export type SkillLevel = (typeof SKILL_LEVELS)[number]

export const TIMEFRAME_UNITS = ['weeks', 'months'] as const

export type TimeframeUnit = (typeof TIMEFRAME_UNITS)[number]

export interface TargetTimeframe {
  value: number
  unit: TimeframeUnit
}

export interface LearningPathFormValues {
  careerGoal: string
  skillLevel: SkillLevel
  existingSkills: string
  background: string
  hoursPerWeek: number
  targetTimeframe: TargetTimeframe | null
}
