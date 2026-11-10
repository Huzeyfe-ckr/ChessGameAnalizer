export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
      <div className="h-full bg-gold transition-all duration-200" style={{ width: `${value * 100}%` }} />
    </div>
  );
}
