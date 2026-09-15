import { FormEvent, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { createNotification } from "../../services/notificationsService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useNotificationsQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { usePermission } from "../../features/auth/usePermission";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { Alert, Button, Field, Input } from "../../shared/ui";
import type { CreateNotificationRequest, NotificationResponse } from "../../types/notifications";

export function NotificationsPage() {
  const location = useLocation();
  const query = useNotificationsQuery();
  const invalidate = useInvalidateAdminQueries();
  const canCreate = usePermission("notifications.create");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendPush, setSendPush] = useState(true);
  const [formError, setFormError] = useState("");

  const items = query.data ?? [];
  const listingError = query.error
    ? getQueryErrorMessage(query.error, "Falha ao carregar notificações")
    : undefined;

  const createMutation = useAdminMutation<NotificationResponse, CreateNotificationRequest>({
    mutationFn: createNotification,
    successMessage: "Notificação enviada.",
    errorFallback: "Falha ao enviar notificação",
    toastError: false,
    invalidate: () => invalidate.notifications(),
    onSuccess: () => {
      setTitle("");
      setBody("");
    },
    onError: (error) => setFormError(error.message)
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError("Título e mensagem são obrigatórios.");
      return;
    }
    setFormError("");
    createMutation.mutate({ title: title.trim(), body: body.trim(), sendPush });
  }

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Bell}
          title="Notificações"
          description="Avisos no painel. O push OneSignal usa as chaves em Definições, se existirem."
        />
      }
    >
      {canCreate ? (
        <BerryFormPanel title="Nova notificação">
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            {formError ? <Alert>{formError}</Alert> : null}
            <Field label="Título" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Mensagem" required>
              <textarea
                className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
              Enviar também via OneSignal (se a REST key estiver cadastrada)
            </label>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </BerryFormPanel>
      ) : null}

      {listingError ? <Alert>{listingError}</Alert> : null}
      <BerryFormPanel title="Histórico" description="Últimas 50 notificações visíveis para o seu usuário.">
        <ul className="mt-3 space-y-2">
          {items.length === 0 ? <li className="text-sm text-muted">Nenhuma notificação.</li> : null}
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-surface px-3 py-2">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-sm text-muted">{item.body}</p>
              <p className="mt-1 text-xs text-muted">
                {item.read ? "Lida" : "Não lida"}
                {item.onesignalId ? " · push enviado" : ""}
              </p>
            </li>
          ))}
        </ul>
      </BerryFormPanel>
    </ListingPageShell>
  );
}
