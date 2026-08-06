import { Trash2, UserCheck, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { Button, DetailField, Modal, StatusBadge } from "../../../shared/ui";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type { UserResponse } from "../../../types/users";
import { SearchableSelect } from "../form/SearchableSelect";
import { LegacyImage } from "../LegacyImage";

type UserDetailModalProps = {
  user: UserResponse | null;
  open: boolean;
  saving?: boolean;
  acervoOptions: AcervoOptionResponse[];
  onClose: () => void;
  onEdit?: (user: UserResponse) => void;
  onToggleStatus?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
  onSaveAcervo: (user: UserResponse, acervoId: number) => Promise<void>;
};

export function UserDetailModal({
  user,
  open,
  saving = false,
  acervoOptions,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  onSaveAcervo
}: UserDetailModalProps) {
  const [selectedAcervoId, setSelectedAcervoId] = useState<string>("");
  const [acervoError, setAcervoError] = useState("");

  useEffect(() => {
    if (user) {
      setSelectedAcervoId(user.acervoId ? String(user.acervoId) : "");
      setAcervoError("");
    }
  }, [user]);

  const acervoSelectOptions = useMemo(
    () =>
      acervoOptions.map((acervo) => ({
        value: String(acervo.id),
        label: decodeHtmlEntities(acervo.name)
      })),
    [acervoOptions]
  );

  if (!user) {
    return null;
  }

  const currentUser = user;
  const name = decodeHtmlEntities(currentUser.name);
  const isActive = currentUser.status === "1";
  const acervoChanged = selectedAcervoId !== (currentUser.acervoId ? String(currentUser.acervoId) : "");
  const canSaveAcervo = selectedAcervoId !== "" && acervoChanged;

  async function handleSaveAcervo() {
    if (!canSaveAcervo) {
      return;
    }
    setAcervoError("");
    try {
      await onSaveAcervo(currentUser, Number(selectedAcervoId));
    } catch (error) {
      setAcervoError(error instanceof Error ? error.message : "Falha ao salvar acervo");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      description={`Detalhes do usuario #${currentUser.id}`}
      size="lg"
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          {onEdit ? (
            <Button
              variant="secondary"
              onClick={() => {
                onEdit(currentUser);
              }}
              disabled={saving}
            >
              Editar
            </Button>
          ) : null}
          {onToggleStatus ? (
            <Button
              variant="secondary"
              onClick={() => {
                onToggleStatus(currentUser);
                onClose();
              }}
              disabled={saving}
            >
              {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
              {isActive ? "Desativar" : "Ativar"}
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(currentUser);
                onClose();
              }}
              disabled={saving}
            >
              <Trash2 size={16} />
              Excluir
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div className="flex justify-center sm:justify-start">
          <LegacyImage
            legacyPath={currentUser.userImage}
            folder="images"
            alt={`Avatar de ${name}`}
            className="table-avatar h-24 w-24 text-lg"
            fallbackClassName="table-avatar-placeholder h-24 w-24 text-lg"
            fallbackText={name.charAt(0).toUpperCase()}
          />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailField label="ID" value={`#${currentUser.id}`} />
          <DetailField label="Status" value={<StatusBadge active={isActive} />} />
          <DetailField label="Nome" value={name} className="sm:col-span-2" />
          <DetailField label="Email" value={currentUser.email} className="sm:col-span-2" />
          <DetailField label="Telefone" value={currentUser.phone?.trim() || "—"} />
          <DetailField label="Tipo" value={currentUser.userType} />
          <DetailField
            label="Acervo atual"
            value={
              currentUser.acervoName ? (
                decodeHtmlEntities(currentUser.acervoName)
              ) : (
                <span className="warning-text">Sem acervo</span>
              )
            }
            className="sm:col-span-2"
          />
        </dl>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Vincular acervo</h3>
        <p className="mt-1 text-xs text-muted">
          O usuario vera no app apenas os livros do acervo selecionado.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="form-field flex-1">
            <span>Acervo</span>
            <SearchableSelect
              options={acervoSelectOptions}
              value={selectedAcervoId}
              onChange={setSelectedAcervoId}
              placeholder="Selecione um acervo"
              searchPlaceholder="Buscar acervo..."
              emptyMessage="Nenhum acervo ativo cadastrado."
              allowEmpty
              emptyLabel="Selecione um acervo"
              disabled={saving || acervoOptions.length === 0}
            />
          </div>
          <Button
            variant="primary"
            type="button"
            onClick={handleSaveAcervo}
            disabled={saving || !canSaveAcervo}
          >
            Salvar acervo
          </Button>
        </div>
        {acervoError ? <p className="error-text mt-2">{acervoError}</p> : null}
      </div>
    </Modal>
  );
}
