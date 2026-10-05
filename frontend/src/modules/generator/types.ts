export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export type SkillLevel = (typeof SKILL_LEVELS)[number]

export interface LearningPathFormValues {
  careerGoal: string
  skillLevel: SkillLevel
  existingSkills: string
  background: string
}
