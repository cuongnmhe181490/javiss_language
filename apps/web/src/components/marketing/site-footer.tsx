import Link from "next/link";

const footerLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Placement", href: "/placement" },
  { label: "Speaking demo", href: "/demo-speaking" },
  { label: "Join beta", href: "/register" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background" aria-label="Site footer">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>Polyglot AI Academy beta. Demo data only; no production learner data is shown.</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 font-medium transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
