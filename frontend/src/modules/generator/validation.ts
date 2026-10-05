export const CAREER_GOAL_MIN_LENGTH = 2
export const CAREER_GOAL_MAX_LENGTH = 100

/** Returns an error message, or undefined when the career goal is valid. */
export function validateCareerGoal(value: string): string | undefined {
  const goal = value.trim()
  if (!goal) return 'Enter a career goal.'
  if (goal.length < CAREER_GOAL_MIN_LENGTH) return `Career goal must be at least ${CAREER_GOAL_MIN_LENGTH} characters.`
  if (goal.length > CAREER_GOAL_MAX_LENGTH) return `Career goal must be at most ${CAREER_GOAL_MAX_LENGTH} characters.`
  return undefined
}
