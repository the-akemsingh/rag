import { cn } from "@/lib/utils";

/** Decorative gradient bezel that holds the live product demo. */
export function GradientFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-6 shadow-bezel sm:p-10",
        "bg-[linear-gradient(135deg,oklch(0.88_0.05_250),oklch(0.86_0.06_290))]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[14px] border border-ink/[0.06] bg-surface shadow-panel">
        {children}
      </div>
    </div>
  );
}
