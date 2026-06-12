import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";

export type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 4000;

const toneStyles: Record<ToastTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-primary/30 bg-primary/10 text-foreground"
};

const toneIcon: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current, { id, tone, message }]);
      const timer = setTimeout(() => dismissToast(id), DEFAULT_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-[110] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
          role="region"
          aria-label="Notificacoes"
        >
          <AnimatePresence initial={false}>
            {toasts.map((toast) => {
              const Icon = toneIcon[toast.tone];
              return (
                <motion.div
                  key={toast.id}
                  layout
                  role={toast.tone === "error" ? "alert" : "status"}
                  aria-live={toast.tone === "error" ? "assertive" : "polite"}
                  initial={{ opacity: 0, x: 24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-card backdrop-blur",
                    toneStyles[toast.tone]
                  )}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 break-words text-foreground">{toast.message}</span>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:text-foreground"
                    aria-label="Dispensar notificacao"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/** Hook para disparar notificacoes acessiveis. Deve estar dentro de <ToastProvider>. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  }
  return context;
}
