export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[100] rounded-md bg-background px-4 py-3 text-sm font-medium text-foreground shadow focus:fixed focus:left-4 focus:top-4 focus:inline-flex focus:min-h-11 focus:min-w-11 focus:items-center"
    >
      Skip to main content
    </a>
  );
}
