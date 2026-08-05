import { motion } from "framer-motion";
import { Library, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createAcervo, deleteAcervo, updateAcervo } from "../../services/acervosService";
import {
  getQueryErrorMessage,
  useAcervosQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { useAnyPermission } from "../../features/auth/usePermission";
import { AcervoDetailModal } from "../components/acervos/AcervoDetailModal";
import { AcervoFormModal } from "../components/acervos/AcervoFormModal";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { AcervoResponse, UpsertAcervoRequest } from "../../types/acervos";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { Alert, Button, ConfirmDialog, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_FORM: UpsertAcervoRequest = {
  name: "",
  description: "",
  status: "1"
};

export function AcervosPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const acervosQuery = useAcervosQuery();
  const invalidate = useInvalidateAdminQueries();
  const acervos = acervosQuery.data ?? [];
  const loading = acervosQuery.isLoading;
  const listingError = acervosQuery.error
    ? getQueryErrorMessage(acervosQuery.error, "Falha ao carregar acervos")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedAcervo, setSelectedAcervo] = useState<AcervoResponse | null>(null);
  const [form, setForm] = useState<UpsertAcervoRequest>(EMPTY_FORM);
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);

  const isNameInvalid = form.name.trim().length === 0;
  const isFormInvalid = isNameInvalid;
  const canCreateAcervo = useAnyPermission(["acervos.create"]);
  const canUpdateAcervo = useAnyPermission(["acervos.update"]);
  const canDeleteAcervo = useAnyPermission(["acervos.delete"]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowValidation(false);
  }

  function closeFormModal() {
    resetForm();
    setFormError("");
    setFormModalOpen(false);
  }

  function openCreateForm() {
    resetForm();
    setFormError("");
    setFormModalOpen(true);
  }

  useEffect(() => {
    setSelectedAcervo((current) => {
      if (!current) {
        return null;
      }
      return acervos.find((item) => item.id === current.id) ?? null;
    });
  }, [acervos]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShowValidation(true);
    if (isFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const payload: UpsertAcervoRequest = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        status: form.status
      };
      if (editingId) {
        await updateAcervo(editingId, payload);
        showToast("Acervo atualizado com sucesso.", "success");
      } else {
        await createAcervo(payload);
        showToast("Acervo criado com sucesso.", "success");
      }
      closeFormModal();
      await invalidate.acervos();
      await invalidate.acervoOptions();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar acervo");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(acervo: AcervoResponse) {
    setEditingId(acervo.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      name: decodeHtmlEntities(acervo.name),
      description: stripHtml(acervo.description) ?? "",
      status: acervo.status
    });
    setSelectedAcervo(null);
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(acervo: AcervoResponse) {
    if (!canUpdateAcervo) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateAcervo(acervo.id, {
        name: acervo.name,
        description: acervo.description ?? undefined,
        status: "1"
      });
      showToast("Acervo ativado com sucesso.", "success");
      await invalidate.acervos();
      await invalidate.acervoOptions();
    } catch (activateError) {
      const message =
        activateError instanceof Error ? activateError.message : "Falha ao ativar acervo";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const acervoId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteAcervo(acervoId);
      if (editingId === acervoId) {
        closeFormModal();
      }
      if (selectedAcervo?.id === acervoId) {
        setSelectedAcervo(null);
      }
      showToast("Acervo desativado com sucesso.", "success");
      await invalidate.acervos();
      await invalidate.acervoOptions();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar acervo";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
  }

  const filteredAcervos = useMemo(() => {
    return acervos.filter((acervo) => {
      const byStatus = statusFilter === "all" || acervo.status === statusFilter;
      const normalized = search.trim().toLowerCase();
      const description = stripHtml(acervo.description)?.toLowerCase() ?? "";
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(acervo.name).toLowerCase().includes(normalized) ||
        description.includes(normalized) ||
        String(acervo.id).includes(normalized);
      return byStatus && byText;
    });
  }, [acervos, search, statusFilter]);

  const columns = useMemo<DataTableColumn<AcervoResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (acervo) => acervo.id },
      { key: "name", label: "Nome", render: (acervo) => decodeHtmlEntities(acervo.name) },
      {
        key: "books",
        label: "Livros",
        align: "right",
        render: (acervo) => acervo.bookCount.toLocaleString("pt-BR")
      },
      {
        key: "users",
        label: "Usuarios",
        align: "right",
        render: (acervo) => acervo.userCount.toLocaleString("pt-BR")
      },
      {
        key: "status",
        label: "Status",
        render: (acervo) => <StatusBadge active={acervo.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (acervo) => (
          <TableRowActions>
            {canUpdateAcervo ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(acervo)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canUpdateAcervo && acervo.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleActivate(acervo)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDeleteAcervo && acervo.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(acervo.id)}
                disabled={saving}
              >
                <Trash2 size={14} />
                Desativar
              </motion.button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [saving, canUpdateAcervo, canDeleteAcervo]
  );

  const listStats = useMemo(() => {
    const active = acervos.filter((acervo) => acervo.status === "1").length;
    const totalBooks = acervos.reduce((sum, acervo) => sum + acervo.bookCount, 0);
    const totalUsers = acervos.reduce((sum, acervo) => sum + acervo.userCount, 0);
    return [
      { label: "Total de acervos", value: acervos.length },
      { label: "Ativos", value: active },
      { label: "Livros vinculados", value: totalBooks },
      {
        label: "Usuarios vinculados",
        value: totalUsers,
        hint: `${filteredAcervos.length} exibidos com filtros`
      }
    ];
  }, [acervos, filteredAcervos]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Library}
          title="Acervos"
          description="Gerencie as bibliotecas digitais de cada escola e vincule livros aos acervos corretos."
          tone="success"
          actions={
            canCreateAcervo ? (
              <PermissionGate anyOf={["acervos.create"]}>
                <Button type="button" onClick={openCreateForm} disabled={saving}>
                  <Plus size={16} />
                  Novo acervo
                </Button>
              </PermissionGate>
            ) : null
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

      <AdminListingSection<AcervoResponse>
        title="Listagem de acervos"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, descricao ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredAcervos}
        loading={loading}
        keyExtractor={(acervo) => acervo.id}
        emptyMessage="Nenhum acervo encontrado para os filtros aplicados."
        countLabel={`${filteredAcervos.length} acervo(s) com o filtro atual`}
        error={listingError}
        onRowClick={setSelectedAcervo}
        renderMobileCard={(acervo) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{acervo.id}</p>
              <h3>{decodeHtmlEntities(acervo.name)}</h3>
              <p className="book-card-author">
                {acervo.bookCount} livros · {acervo.userCount} usuarios
              </p>
              <StatusBadge active={acervo.status === "1"} />
            </div>
          </article>
        )}
      />

      <AcervoFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={showValidation && isNameInvalid}
        isFormInvalid={isFormInvalid}
        saving={saving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
      />

      <AcervoDetailModal
        acervo={selectedAcervo}
        open={selectedAcervo !== null}
        saving={saving}
        onClose={() => setSelectedAcervo(null)}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDelete={(acervo) => setConfirmDeleteId(acervo.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar acervo"
        description="O acervo sera marcado como inativo. Deseja continuar?"
        confirmLabel="Desativar"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
