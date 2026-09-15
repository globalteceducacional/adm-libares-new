import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui";
import { useAuth } from "../../auth/AuthContext";
import {
  useInvalidateAdminQueries,
  useNotificationsQuery,
  useUnreadNotificationsQuery
} from "../../shared/api/queries";
import { markAllNotificationsRead, markNotificationRead } from "../../../services/notificationsService";

export function NotificationBell() {
  const { hasPermission } = useAuth();
  const canView = hasPermission("notifications.view");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listQuery = useNotificationsQuery({ enabled: canView && open });
  const unreadQuery = useUnreadNotificationsQuery({ enabled: canView });
  const invalidate = useInvalidateAdminQueries();
  const unread = unreadQuery.data?.count ?? 0;
  const items = listQuery.data ?? [];

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!canView) {
    return null;
  }

  return (
    <div className="relative" ref={rootRef}>
      <Button
        variant="icon"
        size="icon"
        aria-label={unread > 0 ? `Notificações (${unread} não lidas)` : "Notificações"}
        title="Notificações"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Notificações</p>
            <button
              type="button"
              className="text-xs text-primary"
              onClick={() => {
                void markAllNotificationsRead().then(() => invalidate.notifications());
              }}
            >
              Marcar todas
            </button>
          </div>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {items.length === 0 ? <li className="text-xs text-muted">Nenhuma notificação.</li> : null}
            {items.slice(0, 8).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                  onClick={() => {
                    if (!item.read) {
                      void markNotificationRead(item.id).then(() => invalidate.notifications());
                    }
                  }}
                >
                  <span className={item.read ? "text-muted" : "font-semibold"}>{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{item.body}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 w-full text-center text-xs font-semibold text-primary"
            onClick={() => {
              setOpen(false);
              navigate("/notificacoes");
            }}
          >
            Ver todas
          </button>
        </div>
      ) : null}
    </div>
  );
}
