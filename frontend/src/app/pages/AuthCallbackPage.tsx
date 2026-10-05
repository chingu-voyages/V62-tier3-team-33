import { Link, useSearchParams } from 'react-router'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Sign-in failed</h1>
        <p className="text-muted-foreground">{searchParams.get('error_description') ?? error}</p>
        <Link to="/login" className="underline">
          Try again
        </Link>
      </div>
    )
  }

  // The OAuth provider redirects here with its result (e.g. `code` and `state`) in the query string.
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Signing you in…</h1>
    </div>
  )
}
