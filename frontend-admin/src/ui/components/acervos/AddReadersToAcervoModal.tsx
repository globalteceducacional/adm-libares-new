import { useEffect, useMemo, useState } from "react";
import { getQueryErrorMessage, useUsersQuery } from "../../../features/shared/api/queries";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Alert, Button, Modal, TableSkeleton } from "../../../shared/ui";
import type { AcervoResponse } from "../../../types/acervos";
import type { UserResponse } from "../../../types/users";
import { SearchableCheckboxList, type SearchableCheckboxItem } from "../form/SearchableCheckboxList";

type AddReadersToAcervoModalProps = {
  acervo: AcervoResponse;
  open: boolean;
  saving: boolean;
  /** Progresso "n/total" enquanto vincula em sequencia. */
  progress?: { done: number; total: number } | null;
  error?: string;
  onClose: () => void;
  onConfirm: (users: UserResponse[]) => void;
};

/**
 * Leitores elegiveis: sem acervo ou vinculados a outro acervo do mesmo contrato.
 * Vincular um leitor que ja tem acervo e uma troca (o sublabel deixa isso claro).
 */
export function AddReadersToAcervoModal({
  acervo,
  open,
  saving,
  progress,
  error,
  onClose,
  onConfirm
}: AddReadersToAcervoModalProps) {
  const usersQuery = useUsersQuery(undefined, { enabled: open });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
    }
  }, [open]);

  const eligibleUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    return users.filter((user) => {
      if (user.acervoId === acervo.id) {
        return false;
      }
      // Sem acervo: livre. Com acervo: so se for do mesmo contrato.
      return user.acervoId == null || (acervo.schoolId != null && user.schoolId === acervo.schoolId);
    });
  }, [usersQuery.data, acervo.id, acervo.schoolId]);

  const items = useMemo<SearchableCheckboxItem[]>(
    () =>
      eligibleUsers.map((user) => ({
        id: user.id,
        label: decodeHtmlEntities(user.name),
        description: [
          user.email,
          user.acervoName
            ? `Trocar de: ${decodeHtmlEntities(user.acervoName)}`
            : "Sem acervo",
          user.status === "1" ? null : "Inativo"
        ]
          .filter(Boolean)
          .join(" · ")
      })),
    [eligibleUsers]
  );

  function toggle(userId: number) {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  }

  function handleConfirm() {
    const selectedSet = new Set(selectedIds);
    onConfirm(eligibleUsers.filter((user) => selectedSet.has(user.id)));
  }

  const loadError = usersQuery.error
    ? getQueryErrorMessage(usersQuery.error, "Falha ao carregar leitores")
    : undefined;
  const switching = eligibleUsers.filter(
    (user) => selectedIds.includes(user.id) && user.acervoId != null
  ).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar leitores ao acervo"
      description={`Os leitores selecionados passarao a ver o catalogo de "${decodeHtmlEntities(acervo.name)}".`}
      size="xl"
      closeOnOverlayClick={!saving}
      hideCloseButton={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving || selectedIds.length === 0}>
            {saving && progress
              ? `Vinculando ${progress.done}/${progress.total}...`
              : selectedIds.length > 0
                ? `Vincular ${selectedIds.length} leitor(es)`
                : "Vincular"}
          </Button>
        </>
      }
    >
      {usersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : loadError ? (
        <Alert tone="danger">{loadError}</Alert>
      ) : (
        <SearchableCheckboxList
          items={items}
          selectedIds={selectedIds}
          onToggle={toggle}
          tall
          disabled={saving}
          searchPlaceholder="Buscar por nome ou e-mail"
          emptyMessage="Nenhum leitor elegivel: todos ja estao neste acervo ou pertencem a outro contrato."
        />
      )}
      {switching > 0 ? (
        <Alert tone="warning" className="mt-3">
          {switching} leitor(es) selecionado(s) ja tem acervo e sera(ao) movido(s) para este.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      ) : null}
    </Modal>
  );
}
