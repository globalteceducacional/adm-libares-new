import { motion } from "framer-motion";
import { Building2, Pencil, Trash2 } from "lucide-react";
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
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { BerrySelect } from "../components/layout/BerrySelect";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import type { SchoolResponse, UpsertSchoolRequest } from "../../types/schools";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useTimedMessage } from "../../hooks/useTimedMessage";
import { Alert, Button, ConfirmDialog, Field, Input, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

const EMPTY_SCHOOL_FORM: UpsertSchoolRequest = {
  name: "",
  slug: "",
  status: "1"
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
  const { message: success, showMessage: showSuccess, clearMessage: clearSuccess } = useTimedMessage();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSchoolRequest>(EMPTY_SCHOOL_FORM);

  const canCreate = usePermission("schools.create");
  const canUpdate = usePermission("schools.update");
  const canDelete = usePermission("schools.delete");

  const isNameInvalid = form.name.trim().length === 0;

  function resetForm() {
    setForm(EMPTY_SCHOOL_FORM);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    clearSuccess();
    setSaving(true);

    try {
      const payload: UpsertSchoolRequest = {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        status: form.status
      };

      if (editingId) {
        await updateSchool(editingId, payload);
        showSuccess("Escola atualizada com sucesso.");
      } else {
        await createSchool(payload);
        resetForm();
        showSuccess("Escola criada com sucesso.");
      }

      await invalidate.schools();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Falha ao salvar escola");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(school: SchoolResponse) {
    setEditingId(school.id);
    setForm({
      name: decodeHtmlEntities(school.name),
      slug: school.slug,
      status: school.status
    });
    document.getElementById("school-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId === null) {
      return;
    }
    const schoolId = confirmDeleteId;
    setFormError("");
    clearSuccess();
    setSaving(true);
    try {
      await deleteSchool(schoolId);
      if (editingId === schoolId) {
        resetForm();
      }
      showSuccess("Escola desativada com sucesso.");
      await invalidate.schools();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar escola");
    } finally {
      setSaving(false);
      setConfirmDeleteId(null);
    }
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
            {canDelete ? (
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
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
        <PermissionGate anyOf={["schools.create", "schools.update"]}>
          <BerryFormPanel
            id="school-form-section"
            icon={Building2}
            title={editingId ? "Editar escola" : "Cadastrar nova escola"}
            description="Defina nome, slug e status para isolar dados por tenant."
          >
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
                <Field label="Nome" required>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </Field>
                <Field label="Slug" hint="Opcional — gerado automaticamente se vazio">
                  <Input
                    value={form.slug ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  />
                </Field>
                <BerrySelect
                  label="Status"
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="1">Ativa</option>
                  <option value="0">Inativa</option>
                </BerrySelect>
                <div className="flex items-end gap-2 md:col-span-2">
                  {(editingId ? canUpdate : canCreate) ? (
                    <Button type="submit" disabled={saving || isNameInvalid}>
                      {editingId ? "Salvar escola" : "Criar escola"}
                    </Button>
                  ) : null}
                  {editingId ? (
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                      Cancelar edicao
                    </Button>
                  ) : null}
                </div>
              </form>

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

        <AdminListingSection<SchoolResponse>
          title="Listagem de escolas"
          success={editingId ? undefined : success}
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
