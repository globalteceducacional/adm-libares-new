import { motion } from "framer-motion";
import { Plus, UserCog } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createTeamMember, toggleTeamMemberStatus } from "../../services/teamService";
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
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import {
  buildInitialTeamMemberForm,
  type CreateTeamMemberFormState,
  toCreateTeamMemberRequest
} from "../components/team/CreateTeamMemberForm";
import { TeamFormModal } from "../components/team/TeamFormModal";
import type { TeamMemberResponse } from "../../types/team";
import { Alert, Button, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

function formatRoleLabel(roleCode: string): string {
  if (roleCode === "SCHOOL_ADMIN") {
    return "Admin da escola";
  }
  if (roleCode === "PROFESSOR") {
    return "Professor";
  }
  return roleCode;
}

type ToggleTeamMemberVariables = {
  member: TeamMemberResponse;
};

export function TeamPage() {
  const location = useLocation();
  const { user, isSuperAdmin, requiresSchoolContext, schoolContextId } = useAuth();
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
  const currentUserId = user?.id ?? null;

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
  const [formError, setFormError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  // Erros de campo so apos tentativa de salvar.
  const [showValidation, setShowValidation] = useState(false);
  const canCreate = usePermission("team.create");
  const canToggle = usePermission("team.toggle_status");
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

  async function invalidateTeamQueries() {
    await invalidate.team();
  }

  const createMutation = useAdminMutation<TeamMemberResponse, CreateTeamMemberFormState>({
    mutationFn: (form) => createTeamMember(toCreateTeamMemberRequest(form)),
    successMessage: "Membro da equipe criado com sucesso.",
    errorFallback: "Falha ao criar membro da equipe",
    toastError: false,
    invalidate: invalidateTeamQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const toggleMutation = useAdminMutation<TeamMemberResponse, ToggleTeamMemberVariables>({
    mutationFn: ({ member }) => {
      const nextStatus: "0" | "1" = member.status === "1" ? "0" : "1";
      return toggleTeamMemberStatus(member.id, nextStatus);
    },
    successMessage: (_data, { member }) => {
      const nextStatus = member.status === "1" ? "0" : "1";
      const label = nextStatus === "1" ? "ativado" : "desativado";
      return `Membro ${label} com sucesso.`;
    },
    errorFallback: "Falha ao alterar status",
    invalidate: invalidateTeamQueries
  });

  const saving = createMutation.isPending || toggleMutation.isPending;

  function resetCreateForm() {
    setCreateForm(buildInitialTeamMemberForm(isSuperAdmin, defaultSchoolId));
    setShowValidation(false);
    setFormError("");
  }

  function closeFormModal() {
    resetCreateForm();
    setFormModalOpen(false);
  }

  function openCreateForm() {
    if (needsSchoolContext) {
      return;
    }
    resetCreateForm();
    setFormModalOpen(true);
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
    try {
      await createMutation.mutateAsync(createForm);
    } catch {
      // Erro ja tratado em onError do useAdminMutation (formError).
    }
  }

  function handleToggleStatus(member: TeamMemberResponse) {
    if (!canToggle || currentUserId === member.id) {
      return;
    }
    toggleMutation.mutate({ member });
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
      },
      ...(canToggle
        ? [
            {
              key: "actions",
              label: "Acoes",
              stopRowClick: true,
              render: (member: TeamMemberResponse) => {
                const isSelf = currentUserId === member.id;
                return (
                  <TableRowActions>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      className="table-btn icon"
                      type="button"
                      onClick={() => handleToggleStatus(member)}
                      disabled={saving || isSelf}
                      title={isSelf ? "Nao e permitido alterar o proprio usuario" : undefined}
                      aria-label={
                        member.status === "1"
                          ? `Desativar ${decodeHtmlEntities(member.name)}`
                          : `Ativar ${decodeHtmlEntities(member.name)}`
                      }
                    >
                      {member.status === "1" ? "Desativar" : "Ativar"}
                    </motion.button>
                  </TableRowActions>
                );
              }
            } satisfies DataTableColumn<TeamMemberResponse>
          ]
        : [])
    ],
    [canToggle, currentUserId, saving]
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
          actions={
            canCreate ? (
              <PermissionGate permission="team.create">
                <Button
                  type="button"
                  onClick={openCreateForm}
                  disabled={saving || needsSchoolContext}
                >
                  <Plus size={16} />
                  Novo membro
                </Button>
              </PermissionGate>
            ) : null
          }
        />
      }
      stats={<ListingMiniStats items={listStats} />}
    >
      {needsSchoolContext ? (
        <Alert tone="warning">
          Selecione uma escola no topo do painel para cadastrar membros da equipe.
        </Alert>
      ) : null}

      {formError && !formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {formError}
        </Alert>
      ) : null}

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
        renderMobileCard={(member) => {
          const isSelf = currentUserId === member.id;
          return (
            <article className="book-card">
              <div className="book-card-body">
                <p className="book-card-id">#{member.id}</p>
                <h3>{decodeHtmlEntities(member.name)}</h3>
                <p className="book-card-author">{member.username}</p>
                <p className="book-card-author">
                  {member.schoolName
                    ? decodeHtmlEntities(member.schoolName)
                    : `Escola #${member.schoolId}`}
                </p>
                <p className="book-card-author">{formatRoleLabel(member.roleCode)}</p>
                <StatusBadge active={member.status === "1"} />
                {canToggle ? (
                  <div className="book-card-actions">
                    <button
                      className="table-btn icon"
                      type="button"
                      onClick={() => handleToggleStatus(member)}
                      disabled={saving || isSelf}
                      title={isSelf ? "Nao e permitido alterar o proprio usuario" : undefined}
                    >
                      {member.status === "1" ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        }}
      />

      <TeamFormModal
        open={formModalOpen}
        form={createForm}
        saving={saving}
        isSuperAdmin={isSuperAdmin}
        needsSchoolContext={needsSchoolContext}
        isFormInvalid={showValidation && isCreateFormInvalid}
        schoolOptions={schoolOptions}
        error={formError}
        onClose={closeFormModal}
        onSubmit={handleCreateMember}
        onReset={closeFormModal}
        onFormChange={setCreateForm}
      />
    </ListingPageShell>
  );
}
