import { motion } from "framer-motion";
import { Building2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createSchool, deleteSchool, updateSchool } from "../../services/schoolsService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSchoolsQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { SchoolFormModal } from "../components/schools/SchoolFormModal";
import type { SchoolResponse, UpsertSchoolRequest } from "../../types/schools";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { Alert, Button, ConfirmDialog, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_SCHOOL_FORM: UpsertSchoolRequest = {
  name: "",
  slug: "",
  status: "1"
};

type SaveSchoolVariables = {
  editingId: number | null;
  payload: UpsertSchoolRequest;
};

export function SchoolsPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const schoolsQuery = useSchoolsQuery();
  const invalidate = useInvalidateAdminQueries();
  const schools = schoolsQuery.data ?? [];
  const loading = schoolsQuery.isLoading;
  const listingError = schoolsQuery.error
    ? getQueryErrorMessage(schoolsQuery.error, "Falha ao carregar escolas")
    : undefined;

  const [formError, setFormError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSchoolRequest>(EMPTY_SCHOOL_FORM);
  // Erros de campo so apos tentativa de salvar.
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("schools.create");
  const canUpdate = usePermission("schools.update");
  const canDelete = usePermission("schools.delete");

  const isNameInvalid = form.name.trim().length === 0;

  async function invalidateSchoolQueries() {
    await invalidate.schools();
  }

  const saveMutation = useAdminMutation<SchoolResponse, SaveSchoolVariables>({
    mutationFn: async ({ editingId: id, payload }) =>
      id ? updateSchool(id, payload) : createSchool(payload),
    successMessage: (_data, { editingId: id }) =>
      id ? "Escola atualizada com sucesso." : "Escola criada com sucesso.",
    errorFallback: "Falha ao salvar escola",
    toastError: false,
    invalidate: invalidateSchoolQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const activateMutation = useAdminMutation<SchoolResponse, SchoolResponse>({
    mutationFn: (school) =>
      updateSchool(school.id, {
        name: school.name,
        slug: school.slug,
        status: "1"
      }),
    successMessage: "Escola ativada com sucesso.",
    errorFallback: "Falha ao ativar escola",
    invalidate: invalidateSchoolQueries,
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: (schoolId) => deleteSchool(schoolId),
    successMessage: "Escola desativada com sucesso.",
    errorFallback: "Falha ao desativar escola",
    invalidate: invalidateSchoolQueries,
    onSuccess: (_data, schoolId) => {
      if (editingId === schoolId) {
        closeFormModal();
      }
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      setFormError(error.message);
      setConfirmDeleteId(null);
    }
  });

  const saving =
    saveMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

  function resetForm() {
    setForm(EMPTY_SCHOOL_FORM);
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShowValidation(true);
    if (isNameInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    try {
      await saveMutation.mutateAsync({
        editingId,
        payload: {
          name: form.name.trim(),
          slug: form.slug?.trim() || undefined,
          status: form.status
        }
      });
    } catch {
      // Erro ja tratado em onError do useAdminMutation (formError).
    }
  }

  function handleEdit(school: SchoolResponse) {
    setEditingId(school.id);
    setShowValidation(false);
    setFormError("");
    setForm({
      name: decodeHtmlEntities(school.name),
      slug: school.slug,
      status: school.status
    });
    setFormModalOpen(true);
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  function handleActivate(school: SchoolResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    activateMutation.mutate(school);
  }

  function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    setFormError("");
    deleteMutation.mutate(confirmDeleteId);
  }

  const filteredSchools = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return schools.filter((school) => {
      const byStatus = statusFilter === "all" || school.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(school.name).toLowerCase().includes(normalized) ||
        school.slug.toLowerCase().includes(normalized) ||
        String(school.id).includes(normalized);
      return byStatus && byText;
    });
  }, [schools, search, statusFilter]);

  const columns: DataTableColumn<SchoolResponse>[] = useMemo(
    () => [
      { key: "id", label: "ID", render: (school) => school.id },
      { key: "name", label: "Nome", render: (school) => decodeHtmlEntities(school.name) },
      { key: "slug", label: "Slug", render: (school) => school.slug },
      {
        key: "status",
        label: "Status",
        render: (school) => <StatusBadge active={school.status === "1"} />
      },
      {
        key: "actions",
        label: "Acoes",
        stopRowClick: true,
        render: (school) => (
          <TableRowActions>
            {canUpdate ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleEdit(school)}
                disabled={saving}
              >
                <Pencil size={14} />
                Editar
              </motion.button>
            ) : null}
            {canUpdate && school.status !== "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn icon"
                type="button"
                onClick={() => handleActivate(school)}
                disabled={saving}
              >
                <Power size={14} />
                Ativar
              </motion.button>
            ) : null}
            {canDelete && school.status === "1" ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="table-btn danger icon"
                type="button"
                onClick={() => setConfirmDeleteId(school.id)}
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
    [saving, canUpdate, canDelete]
  );

  const listStats = useMemo(() => {
    const active = schools.filter((school) => school.status === "1").length;
    return [
      { label: "Total de escolas", value: schools.length },
      { label: "Ativas", value: active },
      { label: "Inativas", value: schools.length - active },
      {
        label: "Exibidas agora",
        value: filteredSchools.length,
        hint: "Com filtros aplicados"
      }
    ];
  }, [schools, filteredSchools]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Building2}
          title="Escolas"
          description="Gerencie tenants da plataforma."
          tone="warning"
          actions={
            canCreate ? (
              <PermissionGate anyOf={["schools.create"]}>
                <Button type="button" onClick={openCreateForm} disabled={saving}>
                  <Plus size={16} />
                  Nova escola
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

      <AdminListingSection<SchoolResponse>
        title="Listagem de escolas"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, slug ou ID"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredSchools}
        loading={loading}
        keyExtractor={(school) => school.id}
        emptyMessage="Nenhuma escola encontrada."
        countLabel={`${filteredSchools.length} escola(s) com o filtro atual`}
        error={listingError}
      />

      <SchoolFormModal
        open={formModalOpen}
        editingId={editingId}
        form={form}
        isNameInvalid={showValidation && isNameInvalid}
        saving={saving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        onReset={closeFormModal}
        onFormChange={setForm}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Desativar escola"
        description="A escola sera marcada como inativa. Deseja continuar?"
        confirmLabel="Desativar"
        tone="danger"
        loading={saving}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </ListingPageShell>
  );
}
