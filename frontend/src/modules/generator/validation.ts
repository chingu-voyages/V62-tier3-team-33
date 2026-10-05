import { SKILL_LEVELS } from './types'

export const CAREER_GOAL_MIN_LENGTH = 2
export const CAREER_GOAL_MAX_LENGTH = 100
export const EXISTING_SKILLS_MAX_LENGTH = 300
export const BACKGROUND_MAX_LENGTH = 500

/** Each validator returns an error message, or undefined when the value is valid. */
export function validateCareerGoal(value: string): string | undefined {
  const goal = value.trim()
  if (!goal) return 'Enter a career goal.'
  if (goal.length < CAREER_GOAL_MIN_LENGTH) return `Career goal must be at least ${CAREER_GOAL_MIN_LENGTH} characters.`
  if (goal.length > CAREER_GOAL_MAX_LENGTH) return `Career goal must be at most ${CAREER_GOAL_MAX_LENGTH} characters.`
  return undefined
}

export function validateSkillLevel(value: string): string | undefined {
  if (!value) return 'Select your current skill level.'
  if (!(SKILL_LEVELS as readonly string[]).includes(value)) return 'Select a valid skill level.'
  return undefined
}

// Optional field: only the length is checked.
export function validateExistingSkills(value: string): string | undefined {
  if (value.trim().length > EXISTING_SKILLS_MAX_LENGTH)
    return `Existing skills must be at most ${EXISTING_SKILLS_MAX_LENGTH} characters.`
  return undefined
}

// Optional field: only the length is checked.
export function validateBackground(value: string): string | undefined {
  if (value.trim().length > BACKGROUND_MAX_LENGTH) return `Background must be at most ${BACKGROUND_MAX_LENGTH} characters.`
  return undefined
}
