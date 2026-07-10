import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./Button";

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl"
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeMap;
  /** Quando false, o clique no overlay nao fecha o modal (ex.: enquanto salva). */
  closeOnOverlayClick?: boolean;
  /** Esconde o botao "X". O modal continua acessivel via Esc. */
  hideCloseButton?: boolean;
  className?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog acessivel: trava o foco (focus trap), fecha com Esc, restaura o foco
 * anterior ao fechar e bloqueia o scroll do body enquanto aberto.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  hideCloseButton = false,
  className
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Guarda o elemento focado antes de abrir para restaurar ao fechar.
  useEffect(() => {
    if (!open) {
      return;
    }
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move o foco para o primeiro elemento focavel do dialog.
    const focusTimer = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const focusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? dialog).focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onKeyDown={handleKeyDown}
        >
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              "relative z-10 flex w-full max-w-[calc(100vw-1.5rem)] max-h-[min(100dvh-1.5rem,920px)] flex-col rounded-2xl border border-border bg-surface shadow-card outline-none",
              sizeMap[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 md:px-6 md:py-5">
              <div className="min-w-0 flex-1 space-y-1">
                <h2
                  id={titleId}
                  className="line-clamp-2 text-base font-semibold text-foreground md:text-lg"
                >
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className="text-sm text-muted">
                    {description}
                  </p>
                ) : null}
              </div>
              {!hideCloseButton ? (
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="shrink-0">
                  <X size={18} />
                </Button>
              ) : null}
            </div>

            {children ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-sm text-foreground md:px-6">
                {children}
              </div>
            ) : null}

            {footer ? (
              <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-4 py-4 md:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
