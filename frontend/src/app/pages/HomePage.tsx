import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <Button>Get started</Button>
    </div>
  )
}
