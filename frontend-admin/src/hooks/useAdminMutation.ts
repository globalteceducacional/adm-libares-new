import {
  useMutation,
  type UseMutationResult
} from "@tanstack/react-query";
import { useToast, type ToastTone } from "../shared/ui";

type SuccessMessage<TData, TVariables> =
  | string
  | ((data: TData, variables: TVariables) => string);

export type UseAdminMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Toast de sucesso; omitir para nao exibir. */
  successMessage?: SuccessMessage<TData, TVariables>;
  /** Mensagem fallback se o erro nao for Error. */
  errorFallback?: string;
  /** Invalida queries apos sucesso (ex.: invalidate.categories). */
  invalidate?: () => void | Promise<void>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  /** Se false, nao mostra toast de erro (util em forms com Alert). Default: true. */
  toastError?: boolean;
  successTone?: ToastTone;
};

/**
 * Wrapper de useMutation com toast + invalidate padrao do painel admin.
 */
export function useAdminMutation<TData = unknown, TVariables = void>(
  options: UseAdminMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const { showToast } = useToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      if (options.successMessage) {
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(data, variables)
            : options.successMessage;
        showToast(message, options.successTone ?? "success");
      }
      await options.invalidate?.();
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const message =
        error instanceof Error
          ? error.message
          : (options.errorFallback ?? "Falha na operacao");
      if (options.toastError !== false) {
        showToast(message, "error");
      }
      options.onError?.(
        error instanceof Error ? error : new Error(message),
        variables
      );
    }
  });
}
