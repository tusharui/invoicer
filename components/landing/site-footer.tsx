const links: { href: string; label: string; external?: boolean }[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#sample", label: "Sample" },
  { href: "#faq", label: "FAQ" },
  { href: "https://github.com/tusharui/invoicer", label: "GitHub", external: true },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="text-xl font-semibold tracking-tight text-black">
            Invoicer
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Simple billing without the extra hassle
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-zinc-600 underline-offset-4 hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <p className="font-mono text-xs tracking-wide text-zinc-500">
          2026 Invoicer
        </p>
      </div>
    </footer>
  );
}
