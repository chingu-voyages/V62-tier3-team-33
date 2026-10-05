import { SKILL_LEVELS, TIMEFRAME_UNITS, type TimeframeUnit } from './types'

export const CAREER_GOAL_MIN_LENGTH = 2
export const CAREER_GOAL_MAX_LENGTH = 100
export const EXISTING_SKILLS_MAX_LENGTH = 300
export const BACKGROUND_MAX_LENGTH = 500
export const HOURS_PER_WEEK_MAX = 80
export const TIMEFRAME_MAX: Record<TimeframeUnit, number> = { weeks: 104, months: 24 }

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

export function validateHoursPerWeek(value: string): string | undefined {
  const text = value.trim()
  if (!text) return 'Enter how many hours per week you can study.'
  const hours = Number(text)
  if (!Number.isFinite(hours)) return 'Hours per week must be a number.'
  if (hours <= 0) return 'Hours per week must be greater than 0.'
  if (hours > HOURS_PER_WEEK_MAX) return `Hours per week must be ${HOURS_PER_WEEK_MAX} or less.`
  return undefined
}

// Optional field: when a value is given it must be a whole number within the unit's range.
export function validateTargetTimeframe(value: string, unit: string): string | undefined {
  const text = value.trim()
  if (!text) return undefined
  if (!(TIMEFRAME_UNITS as readonly string[]).includes(unit)) return 'Select a valid unit.'
  const amount = Number(text)
  if (!Number.isInteger(amount)) return 'Enter a whole number.'
  if (amount < 1) return 'Timeframe must be at least 1.'
  const max = TIMEFRAME_MAX[unit as TimeframeUnit]
  if (amount > max) return `Timeframe must be ${max} ${unit} or less.`
  return undefined
}
