import { LearningPathForm } from '@/modules/generator'

export function GeneratorPage() {
  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-2xl font-bold">Generate a learning path</h1>
      {/* TODO: connect to the Learning Path generation API once it is available. */}
      <LearningPathForm onSubmit={() => {}} />
    </div>
  )
}
