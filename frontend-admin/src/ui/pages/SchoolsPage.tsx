import { motion } from "framer-motion";
import { Building2, Pencil, Power, Trash2 } from "lucide-react";
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
import { Alert, Button, ConfirmDialog, Field, Input, StatusBadge, useToast } from "../../shared/ui";
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
  const { showToast } = useToast();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const schoolsQuery = useSchoolsQuery();
  const invalidate = useInvalidateAdminQueries();
  const schools = schoolsQuery.data ?? [];
  const loading = schoolsQuery.isLoading;
  const listingError = schoolsQuery.error
    ? getQueryErrorMessage(schoolsQuery.error, "Falha ao carregar escolas")
    : undefined;

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UpsertSchoolRequest>(EMPTY_SCHOOL_FORM);
  // Erros de campo so apos tentativa de salvar.
  const [showValidation, setShowValidation] = useState(false);

  const canCreate = usePermission("schools.create");
  const canUpdate = usePermission("schools.update");
  const canDelete = usePermission("schools.delete");

  const isNameInvalid = form.name.trim().length === 0;

  function resetForm() {
    setForm(EMPTY_SCHOOL_FORM);
    setEditingId(null);
    setShowValidation(false);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShowValidation(true);
    if (isNameInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const payload: UpsertSchoolRequest = {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        status: form.status
      };

      if (editingId) {
        await updateSchool(editingId, payload);
        showToast("Escola atualizada com sucesso.", "success");
      } else {
        await createSchool(payload);
        resetForm();
        showToast("Escola criada com sucesso.", "success");
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
    setShowValidation(false);
    setFormError("");
    setForm({
      name: decodeHtmlEntities(school.name),
      slug: school.slug,
      status: school.status
    });
    document.getElementById("school-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Reenvia os valores como vieram da API para trocar apenas o status.
  async function handleActivate(school: SchoolResponse) {
    if (!canUpdate) {
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await updateSchool(school.id, {
        name: school.name,
        slug: school.slug,
        status: "1"
      });
      showToast("Escola ativada com sucesso.", "success");
      await invalidate.schools();
    } catch (activateError) {
      const message =
        activateError instanceof Error ? activateError.message : "Falha ao ativar escola";
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
    const schoolId = confirmDeleteId;
    setFormError("");
    setSaving(true);
    try {
      await deleteSchool(schoolId);
      if (editingId === schoolId) {
        resetForm();
      }
      showToast("Escola desativada com sucesso.", "success");
      await invalidate.schools();
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar escola");
      showToast(
        deleteError instanceof Error ? deleteError.message : "Falha ao desativar escola",
        "error"
      );
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
            <Field
              label="Nome"
              required
              error={showValidation && isNameInvalid ? "Informe um nome valido." : undefined}
            >
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                invalid={showValidation && isNameInvalid}
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
                <Button type="submit" disabled={saving}>
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

          {formError ? (
            <Alert tone="danger" className="mt-3">
              {formError}
            </Alert>
          ) : null}
        </BerryFormPanel>
      </PermissionGate>

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
