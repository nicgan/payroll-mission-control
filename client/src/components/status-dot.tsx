import type { Status } from "@shared/schema";

export function StatusDot({ status, className = "" }: { status: Status; className?: string }) {
  const colors = {
    RED: "bg-red-500",
    AMBER: "bg-amber-500",
    GREEN: "bg-emerald-500",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]} ${className}`}
      aria-label={`Status: ${status}`}
    />
  );
}
