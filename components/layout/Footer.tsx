import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} {SITE.author} · Moteur{" "}
          <a className="underline hover:text-ink" href="https://stockfishchess.org" target="_blank" rel="noreferrer">
            Stockfish
          </a>{" "}
          (GPL-3.0)
        </p>
        <a className="hover:text-ink" href={SITE.github} target="_blank" rel="noreferrer">
          Code source sur GitHub
        </a>
      </div>
    </footer>
  );
}
