import { motion } from "framer-motion";
import { Library, Pencil, Trash2 } from "lucide-react";
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
import { AcervosForm } from "../components/acervos/AcervosForm";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { AcervoResponse, UpsertAcervoRequest } from "../../types/acervos";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function AcervosPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const acervosQuery = useAcervosQuery();
  const invalidate = useInvalidateAdminQueries();
  const acervos = acervosQuery.data ?? [];
  const loading = acervosQuery.isLoading;
  const listingError = acervosQuery.error
    ? getQueryErrorMessage(acervosQuery.error, "Falha ao carregar acervos")
    : undefined;

  const [formError, setFormError] = useState("");
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedAcervo, setSelectedAcervo] = useState<AcervoResponse | null>(null);
  const [form, setForm] = useState<UpsertAcervoRequest>({
    name: "",
    description: "",
    status: "1"
  });

  const isNameInvalid = form.name.trim().length === 0;
  const isFormInvalid = isNameInvalid;
  const canUpdateAcervo = useAnyPermission(["acervos.update"]);
  const canDeleteAcervo = useAnyPermission(["acervos.delete"]);

  function resetForm() {
    setForm({ name: "", description: "", status: "1" });
    setEditingId(null);
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
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      const payload: UpsertAcervoRequest = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        status: form.status
      };
      if (editingId) {
        await updateAcervo(editingId, payload);
        resetForm();
        showSuccess("Acervo atualizado com sucesso.");
      } else {
        await createAcervo(payload);
        resetForm();
        showSuccess("Acervo criado com sucesso.");
      }
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
    setForm({
      name: decodeHtmlEntities(acervo.name),
      description: stripHtml(acervo.description) ?? "",
      status: acervo.status
    });
    document.getElementById("acervo-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const acervoId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteAcervo(acervoId);
      if (editingId === acervoId) {
        resetForm();
      }
      if (selectedAcervo?.id === acervoId) {
        setSelectedAcervo(null);
      }
      showSuccess("Acervo desativado com sucesso.");
      await invalidate.acervos();
      await invalidate.acervoOptions();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar acervo");
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
            {canDeleteAcervo ? (
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
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
        <PermissionGate anyOf={["acervos.create", "acervos.update"]}>
          <BerryFormPanel
            id="acervo-form-section"
            icon={Library}
            title={editingId ? "Editar acervo" : "Cadastrar novo acervo"}
            description="Preencha nome e descricao para organizar livros e usuarios por biblioteca."
          >
            <AcervosForm
              form={form}
              editingId={editingId}
              saving={saving}
              isNameInvalid={isNameInvalid}
              isFormInvalid={isFormInvalid}
              onSubmit={handleSubmit}
              onReset={() => {
                resetForm();
                clearSuccess();
                setFormError("");
              }}
              onChange={setForm}
            />
            {success ? (
              <Alert tone="success" className="mt-3">
                {success}
              </Alert>
            ) : null}
            {formError ? (
              <Alert tone="danger" className="mt-3">
                {formError}
              </Alert>
            ) : null}
          </BerryFormPanel>
        </PermissionGate>

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

        <AcervoDetailModal
          acervo={selectedAcervo}
          open={selectedAcervo !== null}
          saving={saving}
          onClose={() => setSelectedAcervo(null)}
          onEdit={handleEdit}
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
