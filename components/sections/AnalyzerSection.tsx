import { Analyzer } from "@/components/analyzer/Analyzer";

export function AnalyzerSection() {
  return (
    <section id="analyser" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">Analyseur</h2>
      <p className="mb-8 mt-2 text-muted">Colle ta partie, choisis la profondeur, et laisse Stockfish travailler.</p>
      <Analyzer />
    </section>
  );
}
