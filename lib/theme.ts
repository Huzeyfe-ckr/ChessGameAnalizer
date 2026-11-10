/**
 * Lit une variable CSS définie dans app/globals.css (bloc @theme).
 * Sert aux endroits où Tailwind ne s'applique pas : la scène Three.js.
 */
export function cssVar(name: `--${string}`): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Référence CSS à une variable du thème, pour les attributs style / SVG. */
export const themeVar = (name: `--${string}`) => `var(${name})`;
