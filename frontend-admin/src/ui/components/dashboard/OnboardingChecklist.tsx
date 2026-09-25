import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Library, Rocket, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/AuthContext";
import { useAcervosQuery } from "../../../features/shared/api/queries";
import { cn } from "../../../shared/lib/cn";
import { Button } from "../../../shared/ui";
import { acervoHubPath } from "../acervos/acervoRoutes";

const DISMISS_KEY_PREFIX = "adm-onboarding-dismissed:";

type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  icon: typeof Library;
  done: boolean;
  /** Ausente quando o usuario nao tem permissao para agir. */
  cta?: { label: string; to: string };
};

function dismissKey(schoolContextId: number | null): string {
  return `${DISMISS_KEY_PREFIX}${schoolContextId ?? "global"}`;
}

function readDismissed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/**
 * Checklist "acervo -> livros -> leitores" para contratos recem-criados.
 * Deriva tudo de /acervos (ja filtrado pelo contrato do topo); some quando completo.
 */
export function OnboardingChecklist() {
  const { schoolContextId, hasPermission } = useAuth();
  // Sem acervos.view nao ha como derivar o progresso; a query nem e disparada.
  const acervosQuery = useAcervosQuery({ enabled: hasPermission("acervos.view") });
  const storageKey = dismissKey(schoolContextId);
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));

  const steps = useMemo<ChecklistStep[]>(() => {
    const acervos = acervosQuery.data ?? [];
    const firstAcervo = acervos.find((acervo) => acervo.status === "1") ?? acervos[0];
    const hasAcervo = acervos.length > 0;
    const hasBooks = acervos.some((acervo) => acervo.bookCount > 0);
    const hasReaders = acervos.some((acervo) => acervo.userCount > 0);

    return [
      {
        id: "acervo",
        title: "Criar o primeiro acervo",
        description: "O acervo e a biblioteca que os leitores veem no app.",
        icon: Library,
        done: hasAcervo,
        cta: hasPermission("acervos.create")
          ? { label: "Criar acervo", to: "/acervos?new=1" }
          : undefined
      },
      {
        id: "books",
        title: "Vincular livros ao acervo",
        description: "Sem livros, o catalogo do app fica vazio.",
        icon: BookOpen,
        done: hasBooks,
        cta:
          firstAcervo && hasPermission("acervos.update")
            ? { label: "Adicionar livros", to: acervoHubPath(firstAcervo.id) }
            : undefined
      },
      {
        id: "readers",
        title: "Cadastrar leitores",
        description: "Cada leitor precisa estar vinculado a um acervo para acessar o conteudo.",
        icon: Users,
        done: hasReaders,
        cta:
          firstAcervo && hasPermission("users.update")
            ? { label: "Adicionar leitores", to: acervoHubPath(firstAcervo.id, "leitores") }
            : undefined
      }
    ];
  }, [acervosQuery.data, hasPermission]);

  const completed = steps.filter((step) => step.done).length;
  const allDone = completed === steps.length;

  // Enquanto carrega (ou em erro) nao mostramos nada para nao piscar o card.
  if (!acervosQuery.data || allDone || dismissed) {
    return null;
  }

  function handleDismiss() {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // localStorage indisponivel: apenas oculta nesta sessao.
    }
    setDismissed(true);
  }

  const nextStep = steps.find((step) => !step.done);

  return (
    <motion.section
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 shadow-card md:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      aria-labelledby="onboarding-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Rocket size={20} />
          </div>
          <div className="min-w-0">
            <h2 id="onboarding-title" className="font-display text-base font-bold text-foreground md:text-lg">
              Primeiros passos do contrato
            </h2>
            <p className="text-sm text-muted">
              {completed} de {steps.length} concluidos
              {nextStep ? ` · proximo: ${nextStep.title.toLowerCase()}` : ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label="Ocultar checklist de primeiros passos"
          className="shrink-0"
        >
          <X size={16} />
        </Button>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={completed}
        aria-label="Progresso dos primeiros passos"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext = step.id === nextStep?.id;
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border bg-surface p-3",
                step.done ? "border-success/30" : isNext ? "border-primary/40 shadow-sm" : "border-border"
              )}
            >
              <div className="flex items-center gap-2">
                {step.done ? (
                  <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle size={18} className="shrink-0 text-muted" aria-hidden="true" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Passo {index + 1}</span>
                <Icon size={14} className="ml-auto text-muted" aria-hidden="true" />
              </div>
              <p className={cn("text-sm font-semibold", step.done ? "text-muted line-through" : "text-foreground")}>
                {step.title}
              </p>
              <p className="text-xs text-muted">{step.description}</p>
              {!step.done && step.cta ? (
                <Link
                  to={step.cta.to}
                  className={cn(
                    "mt-auto inline-flex items-center gap-1 text-sm font-semibold",
                    isNext ? "text-primary hover:underline" : "text-muted hover:text-foreground"
                  )}
                >
                  {step.cta.label}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
