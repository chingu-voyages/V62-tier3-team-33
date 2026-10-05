import { Textarea } from '@/shared/components/ui/textarea'
import { BACKGROUND_MAX_LENGTH } from '../validation'
import { FormField } from './FormField'

interface BackgroundFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function BackgroundField({ value, onChange, onBlur, error }: BackgroundFieldProps) {
  return (
    <FormField
      label="Background and experience (optional)"
      hint="Anything relevant that isn't covered by your skills, such as previous jobs, studies or projects."
      error={error}
    >
      {(controlProps) => (
        <Textarea
          {...controlProps}
          name="background"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          maxLength={BACKGROUND_MAX_LENGTH}
        />
      )}
    </FormField>
  )
}
