import { Select } from '@/shared/components/ui/select'
import { SKILL_LEVELS } from '../types'
import { FormField } from './FormField'

interface SkillLevelFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function SkillLevelField({ value, onChange, onBlur, error }: SkillLevelFieldProps) {
  return (
    <FormField label="Current skill level" error={error}>
      {(controlProps) => (
        <Select
          {...controlProps}
          name="skillLevel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-required="true"
        >
          <option value="">Select your level</option>
          {SKILL_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      )}
    </FormField>
  )
}
