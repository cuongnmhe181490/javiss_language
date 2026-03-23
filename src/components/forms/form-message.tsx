export function FormMessage({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) {
    return null;
  }

  return (
    <p
      className={
        error
          ? "text-sm text-rose-600 dark:text-rose-400"
          : "text-sm text-emerald-600 dark:text-emerald-400"
      }
    >
      {error ?? message}
    </p>
  );
}
