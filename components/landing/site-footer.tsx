const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#sample", label: "Sample" },
  { href: "#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="text-lg font-semibold tracking-tight text-black dark:text-white">
            Invoicer
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Simple billing without the extra hassle.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 underline-offset-4 hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
          © 2026 Invoicer
        </p>
      </div>
    </footer>
  );
}
