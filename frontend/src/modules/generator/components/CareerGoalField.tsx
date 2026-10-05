import { useId } from 'react'
import { Input } from '@/shared/components/ui/input'
import { CAREER_GOAL_MAX_LENGTH } from '../validation'

interface CareerGoalFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function CareerGoalField({ value, onChange, onBlur, error }: CareerGoalFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Career goal
      </label>
      <Input
        id={id}
        name="careerGoal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder="e.g. Backend Developer, Data Scientist, UX Designer"
        maxLength={CAREER_GOAL_MAX_LENGTH}
        autoComplete="off"
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
