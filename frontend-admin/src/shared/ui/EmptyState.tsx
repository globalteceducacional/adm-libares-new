import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { Button } from "./Button";

export type EmptyStateAction =
  | { label: string; onClick: () => void; icon?: LucideIcon }
  | { label: string; to: string; icon?: LucideIcon };

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Botao principal (abre form, navega para o proximo passo). */
  action?: EmptyStateAction;
  /** Link discreto abaixo do botao (ex.: "Ver acervos"). */
  secondaryAction?: { label: string; to: string };
  className?: string;
};

function ActionButton({ action }: { action: EmptyStateAction }) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {action.label}
    </>
  );
  if ("to" in action) {
    return (
      <Link
        to={action.to}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
      >
        {content}
      </Link>
    );
  }
  return (
    <Button type="button" onClick={action.onClick}>
      {content}
    </Button>
  );
}

/**
 * Estado vazio com chamada para acao. Use quando a lista *bruta* esta vazia
 * (sem filtros); com filtros ativos prefira uma mensagem simples.
 */
export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-10 text-center md:py-14",
        className
      )}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={26} aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="font-display text-base font-semibold text-foreground md:text-lg">{title}</h3>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <div className="mt-1">
          <ActionButton action={action} />
        </div>
      ) : null}
      {secondaryAction ? (
        <Link to={secondaryAction.to} className="text-sm font-medium text-primary hover:underline">
          {secondaryAction.label}
        </Link>
      ) : null}
    </div>
  );
}
