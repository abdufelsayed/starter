import { Card } from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

export function Shell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Card
      className={cn(
        "w-full max-w-md bg-background px-6 py-8 ring-0 md:bg-card md:ring-1",
        className,
      )}
    >
      {children}
    </Card>
  );
}
