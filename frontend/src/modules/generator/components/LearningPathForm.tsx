import { useState, type SubmitEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import type { LearningPathFormValues, SkillLevel } from '../types'
import { validateBackground, validateCareerGoal, validateExistingSkills, validateSkillLevel } from '../validation'
import { BackgroundField } from './BackgroundField'
import { CareerGoalField } from './CareerGoalField'
import { ExistingSkillsField } from './ExistingSkillsField'
import { SkillLevelField } from './SkillLevelField'

interface LearningPathFormProps {
  onSubmit: (values: LearningPathFormValues) => void
}

type FieldName = 'careerGoal' | 'skillLevel' | 'existingSkills' | 'background'

const validators: Record<FieldName, (value: string) => string | undefined> = {
  careerGoal: validateCareerGoal,
  skillLevel: validateSkillLevel,
  existingSkills: validateExistingSkills,
  background: validateBackground,
}

const emptyValues: Record<FieldName, string> = { careerGoal: '', skillLevel: '', existingSkills: '', background: '' }

// Container for the generator inputs. The form owns the values; fields only render them.
export function LearningPathForm({ onSubmit }: LearningPathFormProps) {
  const [values, setValues] = useState(emptyValues)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})

  const errors = Object.fromEntries(
    (Object.keys(validators) as FieldName[]).map((name) => [name, touched[name] ? validators[name](values[name]) : undefined]),
  ) as Record<FieldName, string | undefined>

  const fieldProps = (name: FieldName) => ({
    value: values[name],
    onChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
    error: errors[name],
  })

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ careerGoal: true, skillLevel: true, existingSkills: true, background: true })
    if ((Object.keys(validators) as FieldName[]).some((name) => validators[name](values[name]))) return
    onSubmit({
      careerGoal: values.careerGoal.trim(),
      skillLevel: values.skillLevel as SkillLevel,
      existingSkills: values.existingSkills.trim(),
      background: values.background.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-xl flex-col gap-6">
      <CareerGoalField {...fieldProps('careerGoal')} />
      <SkillLevelField {...fieldProps('skillLevel')} />
      <ExistingSkillsField {...fieldProps('existingSkills')} />
      <BackgroundField {...fieldProps('background')} />
      <Button type="submit" size="lg" className="self-start">
        Generate Learning Path
      </Button>
    </form>
  )
}
