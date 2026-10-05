import { Input } from '@/shared/components/ui/input'
import { FormField } from './FormField'

interface HoursPerWeekFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function HoursPerWeekField({ value, onChange, onBlur, error }: HoursPerWeekFieldProps) {
  return (
    <FormField label="Hours per week" hint="How many hours you can dedicate to learning each week." error={error}>
      {(controlProps) => (
        <Input
          {...controlProps}
          name="hoursPerWeek"
          type="number"
          inputMode="decimal"
          step="0.5"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder="e.g. 10"
          aria-required="true"
        />
      )}
    </FormField>
  )
}
