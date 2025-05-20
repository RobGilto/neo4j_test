export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted py-2 px-4 border-t text-center text-sm text-muted-foreground">
      <p>© {currentYear} AI Conversation Assistant. All rights reserved.</p>
    </footer>
  )
}
