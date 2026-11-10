export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
      <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${value * 100}%` }} />
    </div>
  );
}
