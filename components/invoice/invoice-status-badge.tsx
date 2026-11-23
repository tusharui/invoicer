import { cn } from "@/lib/utils";

type Props = {
  status: string;
  isOverdue?: boolean;
  className?: string;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  VIEWED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  PARTIALLY_PAID:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  VOID: "bg-zinc-200 text-zinc-700 dark:bg-white/15 dark:text-zinc-300",
  SUPERSEDED:
    "bg-zinc-200 text-zinc-700 dark:bg-white/15 dark:text-zinc-300",
};

function label(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function InvoiceStatusBadge({ status, isOverdue, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
          STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT,
        )}
      >
        {label(status)}
      </span>
      {isOverdue && status !== "OVERDUE" && (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-300">
          Overdue
        </span>
      )}
    </div>
  );
}