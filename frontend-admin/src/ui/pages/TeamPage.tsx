import { UserCog, UserPlus } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createTeamMember } from "../../services/teamService";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSchoolsQuery,
  useTeamMembersQuery
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { useAuth } from "../../features/auth/AuthContext";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import {
  buildInitialTeamMemberForm,
  CreateTeamMemberForm,
  type CreateTeamMemberFormState,
  toCreateTeamMemberRequest
} from "../components/team/CreateTeamMemberForm";
import type { TeamMemberResponse } from "../../types/team";
import { Alert, StatusBadge, useToast } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";

function formatRoleLabel(roleCode: string): string {
  if (roleCode === "SCHOOL_ADMIN") {
    return "Admin da escola";
  }
  if (roleCode === "PROFESSOR") {
    return "Professor";
  }
  return roleCode;
}

export function TeamPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const { isSuperAdmin, requiresSchoolContext, schoolContextId } = useAuth();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const teamQuery = useTeamMembersQuery();
  const schoolsQuery = useSchoolsQuery();
  const invalidate = useInvalidateAdminQueries();

  const members = teamQuery.data ?? [];
  const schools = schoolsQuery.data ?? [];
  const loading = teamQuery.isLoading || schoolsQuery.isLoading;
  const queryError = teamQuery.error
    ? getQueryErrorMessage(teamQuery.error, "Falha ao carregar equipe")
    : schoolsQuery.error
      ? getQueryErrorMessage(schoolsQuery.error, "Falha ao carregar escolas")
      : undefined;

  const schoolOptions = useMemo(() => {
    if (isSuperAdmin) {
      return schools.filter((school) => school.status === "1");
    }
    if (schoolContextId) {
      return schools.filter((school) => school.id === schoolContextId);
    }
    return schools.filter((school) => school.status === "1");
  }, [isSuperAdmin, schools, schoolContextId]);

  const defaultSchoolId = useMemo(() => {
    if (isSuperAdmin) {
      return null;
    }
    return schoolContextId ?? schoolOptions[0]?.id ?? null;
  }, [isSuperAdmin, schoolContextId, schoolOptions]);

  const [createForm, setCreateForm] = useState<CreateTeamMemberFormState>(() =>
    buildInitialTeamMemberForm(isSuperAdmin, defaultSchoolId)
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  // Erros de campo so apos tentativa de salvar.
  const [showValidation, setShowValidation] = useState(false);
  const canCreate = usePermission("team.create");
  const needsSchoolContext = requiresSchoolContext && !schoolContextId;

  // Preenche escola quando o contexto chega depois da montagem (SCHOOL_ADMIN).
  useEffect(() => {
    if (isSuperAdmin || defaultSchoolId == null) {
      return;
    }
    setCreateForm((current) => {
      const nextId = String(defaultSchoolId);
      if (schoolContextId != null) {
        return current.schoolId === nextId ? current : { ...current, schoolId: nextId };
      }
      if (current.schoolId) {
        return current;
      }
      return { ...current, schoolId: nextId };
    });
  }, [isSuperAdmin, defaultSchoolId, schoolContextId]);

  const isCreateFormInvalid =
    createForm.username.trim().length === 0 ||
    createForm.name.trim().length === 0 ||
    createForm.password.length < 6 ||
    !createForm.schoolId ||
    Number.isNaN(Number(createForm.schoolId));

  function resetCreateForm() {
    setCreateForm(buildInitialTeamMemberForm(isSuperAdmin, defaultSchoolId));
    setShowValidation(false);
    setFormError("");
  }

  async function handleCreateMember(event: FormEvent) {
    event.preventDefault();
    if (!canCreate || needsSchoolContext) {
      return;
    }
    setShowValidation(true);
    if (isCreateFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }

    setFormError("");
    setSaving(true);
    try {
      await createTeamMember(toCreateTeamMemberRequest(createForm));
      resetCreateForm();
      showToast("Membro da equipe criado com sucesso.", "success");
      await invalidate.team();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Falha ao criar membro da equipe";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo<DataTableColumn<TeamMemberResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (member) => member.id },
      { key: "name", label: "Nome", render: (member) => decodeHtmlEntities(member.name) },
      { key: "username", label: "Usuario", render: (member) => member.username },
      {
        key: "school",
        label: "Escola",
        render: (member) =>
          member.schoolName ? decodeHtmlEntities(member.schoolName) : `Escola #${member.schoolId}`
      },
      {
        key: "role",
        label: "Perfil",
        render: (member) => formatRoleLabel(member.roleCode)
      },
      {
        key: "status",
        label: "Status",
        render: (member) => <StatusBadge active={member.status === "1"} />
      }
    ],
    []
  );

  const filteredMembers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return members.filter((member) => {
      const byStatus = statusFilter === "all" || member.status === statusFilter;
      const byText =
        normalized.length === 0 ||
        decodeHtmlEntities(member.name).toLowerCase().includes(normalized) ||
        member.username.toLowerCase().includes(normalized) ||
        (member.schoolName?.toLowerCase().includes(normalized) ?? false) ||
        formatRoleLabel(member.roleCode).toLowerCase().includes(normalized) ||
        String(member.id).includes(normalized);
      return byStatus && byText;
    });
  }, [members, search, statusFilter]);

  const emptyMessage = useMemo(
    () =>
      `Nenhum membro da equipe encontrado para os filtros aplicados.${
        search || statusFilter !== "all" ? " Limpe os filtros para ver mais resultados." : ""
      }`,
    [search, statusFilter]
  );

  const listStats = useMemo(() => {
    const active = members.filter((member) => member.status === "1").length;
    const professors = members.filter((member) => member.roleCode === "PROFESSOR").length;
    return [
      { label: "Total na equipe", value: members.length },
      { label: "Ativos", value: active },
      { label: "Professores", value: professors },
      {
        label: "Exibidos agora",
        value: filteredMembers.length,
        hint: "Com filtros aplicados"
      }
    ];
  }, [members, filteredMembers]);

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={UserCog}
          title="Equipe do painel"
          description="Gerencie administradores e professores com acesso ao painel admin."
          tone="info"
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {needsSchoolContext ? (
        <Alert tone="warning">
          Selecione uma escola no topo do painel para cadastrar membros da equipe.
        </Alert>
      ) : null}

      <PermissionGate permission="team.create">
        <BerryFormPanel
          id="team-create-form-section"
          icon={UserPlus}
          title="Cadastrar membro da equipe"
          description="Crie contas de admin da escola ou professor para acesso ao painel."
        >
          <CreateTeamMemberForm
            form={createForm}
            saving={saving}
            isSuperAdmin={isSuperAdmin}
            needsSchoolContext={needsSchoolContext}
            isFormInvalid={showValidation && isCreateFormInvalid}
            schoolOptions={schoolOptions}
            onSubmit={handleCreateMember}
            onReset={resetCreateForm}
            onChange={setCreateForm}
          />
          {formError ? (
            <Alert tone="danger" className="mt-3">
              {formError}
            </Alert>
          ) : null}
        </BerryFormPanel>
      </PermissionGate>

      <AdminListingSection<TeamMemberResponse>
        title="Lista da equipe"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, usuario, escola ou perfil"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filteredMembers}
        loading={loading}
        keyExtractor={(member) => member.id}
        emptyMessage={emptyMessage}
        countLabel={`${filteredMembers.length} membro(s) com o filtro atual`}
        error={queryError}
        renderMobileCard={(member) => (
          <article className="book-card">
            <div className="book-card-body">
              <p className="book-card-id">#{member.id}</p>
              <h3>{decodeHtmlEntities(member.name)}</h3>
              <p className="book-card-author">{member.username}</p>
              <p className="book-card-author">
                {member.schoolName ? decodeHtmlEntities(member.schoolName) : `Escola #${member.schoolId}`}
              </p>
              <p className="book-card-author">{formatRoleLabel(member.roleCode)}</p>
              <StatusBadge active={member.status === "1"} />
            </div>
          </article>
        )}
      />
    </ListingPageShell>
  );
}
