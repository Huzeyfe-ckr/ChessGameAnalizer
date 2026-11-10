import { SITE } from "@/lib/site";

const LINKS = [
  { href: "#analyser", label: "Analyser" },
  { href: "#fonctionnement", label: "Fonctionnement" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#14110e]/40 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#" className="flex items-center gap-2 font-bold">
          <span className="chess-glyph text-2xl text-brand-light">♞{"︎"}</span>
          {SITE.name}
        </a>
        <div className="flex items-center gap-1 sm:gap-4">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hidden rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:block">
              {l.label}
            </a>
          ))}
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-2"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
