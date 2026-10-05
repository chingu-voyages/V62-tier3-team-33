import { Input } from '@/shared/components/ui/input'
import { EXISTING_SKILLS_MAX_LENGTH } from '../validation'
import { FormField } from './FormField'

interface ExistingSkillsFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function ExistingSkillsField({ value, onChange, onBlur, error }: ExistingSkillsFieldProps) {
  return (
    <FormField label="Existing skills (optional)" error={error}>
      {(controlProps) => (
        <Input
          {...controlProps}
          name="existingSkills"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder="e.g. HTML, CSS, JavaScript, Git"
          maxLength={EXISTING_SKILLS_MAX_LENGTH}
          autoComplete="off"
        />
      )}
    </FormField>
  )
}
