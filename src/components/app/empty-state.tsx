import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-5 py-9 text-center",
        className
      )}
    >
      <div className="mb-0.5 flex size-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-[18px] text-muted-foreground/70" strokeWidth={1.6} />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description && (
        <p className="max-w-64 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
