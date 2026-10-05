import { Input } from '@/shared/components/ui/input'
import { Select } from '@/shared/components/ui/select'
import { TIMEFRAME_UNITS } from '../types'
import { FormField } from './FormField'

interface TargetTimeframeFieldProps {
  value: string
  unit: string
  onValueChange: (value: string) => void
  onUnitChange: (unit: string) => void
  onBlur?: () => void
  error?: string
}

export function TargetTimeframeField({
  value,
  unit,
  onValueChange,
  onUnitChange,
  onBlur,
  error,
}: TargetTimeframeFieldProps) {
  return (
    <FormField label="Target timeframe (optional)" hint="How long you would like the learning path to take." error={error}>
      {(controlProps) => (
        <div className="flex gap-2">
          <Input
            {...controlProps}
            name="targetTimeframe"
            type="number"
            inputMode="numeric"
            step="1"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onBlur={onBlur}
            placeholder="e.g. 12"
          />
          <Select
            name="targetTimeframeUnit"
            aria-label="Timeframe unit"
            className="w-32 shrink-0"
            value={unit}
            onChange={(event) => onUnitChange(event.target.value)}
            onBlur={onBlur}
          >
            {TIMEFRAME_UNITS.map((option) => (
              <option key={option} value={option}>
                {option === 'weeks' ? 'Weeks' : 'Months'}
              </option>
            ))}
          </Select>
        </div>
      )}
    </FormField>
  )
}
