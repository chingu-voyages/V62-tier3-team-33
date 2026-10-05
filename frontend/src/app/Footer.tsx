const REPO_URL = 'https://github.com/chingu-voyages/V62-tier3-team-33'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 p-4 text-sm text-muted-foreground">
        <span>Chingu V62 Team 33</span>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          GitHub repository
        </a>
      </div>
    </footer>
  )
}
