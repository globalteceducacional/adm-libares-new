import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardHeader } from "../../../shared/ui/Card";
import { cn } from "../../../shared/lib/cn";

type BerryFormPanelProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function BerryFormPanel({ icon: Icon, title, description, children, className, id }: BerryFormPanelProps) {
  return (
    <Card elevated padding="lg" id={id} className={cn("berry-form-panel min-w-0", className)}>
      <CardHeader
        title={
          Icon ? (
            <span className="inline-flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600/10 text-violet-700 dark:text-violet-300">
                <Icon size={16} />
              </span>
              {title}
            </span>
          ) : (
            title
          )
        }
        description={description}
      />
      {children}
    </Card>
  );
}
