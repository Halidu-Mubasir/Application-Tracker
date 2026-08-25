import type { ApplicationStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        STATUS_COLOR[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
