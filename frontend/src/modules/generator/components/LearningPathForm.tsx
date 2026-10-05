import { useState, type SubmitEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import type { LearningPathFormValues, SkillLevel, TimeframeUnit } from '../types'
import {
  validateBackground,
  validateCareerGoal,
  validateExistingSkills,
  validateHoursPerWeek,
  validateSkillLevel,
  validateTargetTimeframe,
} from '../validation'
import { BackgroundField } from './BackgroundField'
import { CareerGoalField } from './CareerGoalField'
import { ExistingSkillsField } from './ExistingSkillsField'
import { HoursPerWeekField } from './HoursPerWeekField'
import { SkillLevelField } from './SkillLevelField'
import { TargetTimeframeField } from './TargetTimeframeField'

interface LearningPathFormProps {
  onSubmit: (values: LearningPathFormValues) => void
}

interface FormState {
  careerGoal: string
  skillLevel: string
  existingSkills: string
  background: string
  hoursPerWeek: string
  timeframeValue: string
  timeframeUnit: string
}

type FieldName = 'careerGoal' | 'skillLevel' | 'existingSkills' | 'background' | 'hoursPerWeek' | 'targetTimeframe'

const fieldNames: FieldName[] = [
  'careerGoal',
  'skillLevel',
  'existingSkills',
  'background',
  'hoursPerWeek',
  'targetTimeframe',
]

const validators: Record<FieldName, (state: FormState) => string | undefined> = {
  careerGoal: (state) => validateCareerGoal(state.careerGoal),
  skillLevel: (state) => validateSkillLevel(state.skillLevel),
  existingSkills: (state) => validateExistingSkills(state.existingSkills),
  background: (state) => validateBackground(state.background),
  hoursPerWeek: (state) => validateHoursPerWeek(state.hoursPerWeek),
  targetTimeframe: (state) => validateTargetTimeframe(state.timeframeValue, state.timeframeUnit),
}

const emptyState: FormState = {
  careerGoal: '',
  skillLevel: '',
  existingSkills: '',
  background: '',
  hoursPerWeek: '',
  timeframeValue: '',
  timeframeUnit: 'weeks',
}

// Container for the generator inputs. The form owns the values; fields only render them.
export function LearningPathForm({ onSubmit }: LearningPathFormProps) {
  const [state, setState] = useState(emptyState)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})

  const errors = Object.fromEntries(
    fieldNames.map((name) => [name, touched[name] ? validators[name](state) : undefined]),
  ) as Record<FieldName, string | undefined>

  const setField = (key: keyof FormState) => (value: string) => setState((current) => ({ ...current, [key]: value }))
  const touch = (name: FieldName) => () => setTouched((current) => ({ ...current, [name]: true }))

  const fieldProps = (name: Exclude<FieldName, 'targetTimeframe'>) => ({
    value: state[name],
    onChange: setField(name),
    onBlur: touch(name),
    error: errors[name],
  })

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(Object.fromEntries(fieldNames.map((name) => [name, true])))
    const firstInvalid = fieldNames.find((name) => validators[name](state))
    if (firstInvalid) {
      // Field names match the inputs' `name` attribute; focus the first one so the error is announced.
      const control = event.currentTarget.elements.namedItem(firstInvalid)
      if (control instanceof HTMLElement) control.focus()
      return
    }

    const timeframeValue = state.timeframeValue.trim()
    onSubmit({
      careerGoal: state.careerGoal.trim(),
      skillLevel: state.skillLevel as SkillLevel,
      existingSkills: state.existingSkills.trim(),
      background: state.background.trim(),
      hoursPerWeek: Number(state.hoursPerWeek),
      targetTimeframe: timeframeValue
        ? { value: Number(timeframeValue), unit: state.timeframeUnit as TimeframeUnit }
        : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-xl flex-col gap-6">
      <CareerGoalField {...fieldProps('careerGoal')} />
      <SkillLevelField {...fieldProps('skillLevel')} />
      <ExistingSkillsField {...fieldProps('existingSkills')} />
      <BackgroundField {...fieldProps('background')} />
      <HoursPerWeekField {...fieldProps('hoursPerWeek')} />
      <TargetTimeframeField
        value={state.timeframeValue}
        unit={state.timeframeUnit}
        onValueChange={setField('timeframeValue')}
        onUnitChange={setField('timeframeUnit')}
        onBlur={touch('targetTimeframe')}
        error={errors.targetTimeframe}
      />
      <Button type="submit" size="lg" className="self-start">
        Generate Learning Path
      </Button>
    </form>
  )
}
