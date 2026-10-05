import { Link, useParams } from 'react-router'

export function PathPage() {
  const { id } = useParams<{ id: string }>()
  const pathId = id?.trim()

  if (!pathId) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Invalid learning path</h1>
        <p className="text-muted-foreground">No learning path ID was provided.</p>
        <Link to="/generate" className="underline">
          Generate a new learning path
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Learning path</h1>
      <p className="text-muted-foreground">Path ID: {pathId}</p>
    </div>
  )
}
