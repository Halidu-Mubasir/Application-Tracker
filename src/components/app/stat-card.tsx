import { cn } from "@/lib/utils";
import type { StatusFamily } from "@/lib/constants";
import { FAMILY_BAR_CLASSES } from "@/lib/constants";

export function StatCard({
  value,
  label,
  family,
}: {
  value: number;
  label: string;
  family: StatusFamily;
}) {
  const isZero = value === 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card py-3.5 pr-3.5 pl-4 shadow-elevation-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-elevation-md",
        isZero && "opacity-50 hover:opacity-80"
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          FAMILY_BAR_CLASSES[family]
        )}
      />
      <div className="font-mono text-[26px] leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
