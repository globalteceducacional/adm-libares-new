import type { ReactNode } from "react";
import { Card, CardHeader } from "../../../shared/ui/Card";
import { cn } from "../../../shared/lib/cn";

type DashboardChartCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  heightClassName?: string;
};

export function DashboardChartCard({
  title,
  description,
  actions,
  children,
  className,
  heightClassName = "h-[280px] md:h-[320px]"
}: DashboardChartCardProps) {
  return (
    <Card elevated padding="lg" className={cn("berry-chart-card min-w-0", className)}>
      <CardHeader title={title} description={description} actions={actions} />
      <div className={cn("w-full min-w-0", heightClassName)}>{children}</div>
    </Card>
  );
}
