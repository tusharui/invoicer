import { cn } from "@/lib/utils";

export function Money({
  value,
  currency,
  className,
}: {
  value: unknown;
  currency: string;
  className?: string;
}) {
  const amount = Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      <span className="mr-1.5 text-sm font-normal text-zinc-500 dark:text-zinc-400">
        {currency}
      </span>
      {amount}
    </span>
  );
}
