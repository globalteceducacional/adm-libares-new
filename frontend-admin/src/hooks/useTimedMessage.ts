import { useCallback, useEffect, useRef, useState } from "react";

/** Mensagem efémera (sucesso ou aviso) que some após `durationMs`. */
export function useTimedMessage(durationMs = 2600) {
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showMessage = useCallback(
    (text: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage(text);
      timerRef.current = setTimeout(() => {
        setMessage("");
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs]
  );

  const clearMessage = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage("");
  }, []);

  return { message, showMessage, clearMessage };
}
