import { useState, type SubmitEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import type { LearningPathFormValues } from '../types'
import { validateCareerGoal } from '../validation'
import { CareerGoalField } from './CareerGoalField'

interface LearningPathFormProps {
  onSubmit: (values: LearningPathFormValues) => void
}

// Container for the generator inputs. Further fields (skill level, background, time
// commitment) are added here as their own components; the form owns the values.
export function LearningPathForm({ onSubmit }: LearningPathFormProps) {
  const [careerGoal, setCareerGoal] = useState('')
  const [careerGoalTouched, setCareerGoalTouched] = useState(false)

  const careerGoalError = careerGoalTouched ? validateCareerGoal(careerGoal) : undefined

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setCareerGoalTouched(true)
    if (validateCareerGoal(careerGoal)) return
    onSubmit({ careerGoal: careerGoal.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-xl flex-col gap-6">
      <CareerGoalField
        value={careerGoal}
        onChange={setCareerGoal}
        onBlur={() => setCareerGoalTouched(true)}
        error={careerGoalError}
      />
      <Button type="submit" size="lg" className="self-start">
        Generate Learning Path
      </Button>
    </form>
  )
}
