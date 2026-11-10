import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    n: "01",
    title: "Copie ta partie",
    text: "Sur chess.com, à la fin de la partie : Partager → PGN → Copier. Une simple liste de coups marche aussi.",
  },
  {
    n: "02",
    title: "Stockfish l’analyse",
    text: "Le moteur tourne dans ton navigateur, dans un Web Worker. Rien n’est envoyé à un serveur.",
  },
  {
    n: "03",
    title: "Comprends tes erreurs",
    text: "Chaque coup est classé, de « Meilleur coup » à « Gaffe », avec le coup que tu aurais dû jouer.",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">Comment ça marche</h2>
      <p className="mt-2 text-muted">Trois étapes, moins d’une minute.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <Card key={s.n} className="p-6">
            <span className="font-mono text-sm font-semibold text-brand-light">{s.n}</span>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
