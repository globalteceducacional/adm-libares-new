import { useState, type FormEvent } from "react";
import { useAuth } from "../../../features/auth/AuthContext";
import {
  getQueryErrorMessage,
  useInvalidateAdminQueries,
  useSchoolsQuery
} from "../../../features/shared/api/queries";
import { useAdminMutation } from "../../../hooks/useAdminMutation";
import { createAcervo, toggleAcervoStatus, updateAcervo } from "../../../services/acervosService";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../../shared/lib/stripHtml";
import type { AcervoResponse, UpsertAcervoRequest } from "../../../types/acervos";
import type { SchoolResponse } from "../../../types/schools";

const EMPTY_FORM: UpsertAcervoRequest = {
  name: "",
  description: "",
  status: "1",
  schoolId: null
};

type SaveAcervoVariables = {
  editingId: number | null;
  payload: UpsertAcervoRequest;
};

type UseAcervoManagerOptions = {
  /** Chamado apos desativar com sucesso (ex.: limpar selecao na lista). */
  onDeactivated?: (acervoId: number) => void;
};

/**
 * Estado + mutations do formulario de acervo (criar/editar), ativar e desativar.
 * Compartilhado entre a listagem (`AcervosPage`) e o hub (`AcervoHubPage`).
 */
export function useAcervoManager(options?: UseAcervoManagerOptions) {
  const { schoolContextId, allowedSchools } = useAuth();
  const schoolsQuery = useSchoolsQuery();
  const invalidate = useInvalidateAdminQueries();

  const schoolOptions: SchoolResponse[] =
    schoolsQuery.data?.filter((school) => school.status === "1") ??
    allowedSchools.map((school) => ({
      id: school.id,
      name: school.name,
      slug: "",
      status: "1"
    }));
  const schoolsError = schoolsQuery.error
    ? getQueryErrorMessage(schoolsQuery.error, "Falha ao carregar contratos")
    : undefined;

  const [form, setForm] = useState<UpsertAcervoRequest>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  // Erros de campo so apos tentativa de salvar (evita vermelho no form vazio).
  const [showValidation, setShowValidation] = useState(false);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);

  const isNameInvalid = form.name.trim().length === 0;
  const isSchoolInvalid = form.schoolId == null || form.schoolId <= 0;
  const isFormInvalid = isNameInvalid || isSchoolInvalid;

  async function invalidateAcervoQueries() {
    await invalidate.acervos();
    await invalidate.acervoOptions();
  }

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

  const saveMutation = useAdminMutation<AcervoResponse, SaveAcervoVariables>({
    mutationFn: async ({ editingId: id, payload }) =>
      id ? updateAcervo(id, payload) : createAcervo(payload),
    successMessage: (_data, { editingId: id }) =>
      id ? "Acervo atualizado com sucesso." : "Acervo criado com sucesso.",
    errorFallback: "Falha ao salvar acervo",
    toastError: false,
    invalidate: invalidateAcervoQueries,
    onSuccess: () => {
      closeFormModal();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });

  const toggleStatusMutation = useAdminMutation<AcervoResponse, { acervoId: number; status: "0" | "1" }>({
    mutationFn: ({ acervoId, status }) => toggleAcervoStatus(acervoId, status),
    successMessage: (_data, { status }) =>
      status === "1" ? "Acervo ativado com sucesso." : "Acervo desativado com sucesso.",
    errorFallback: "Falha ao alterar status do acervo",
    invalidate: invalidateAcervoQueries,
    onSuccess: (_data, { acervoId, status }) => {
      if (status === "0") {
        if (editingId === acervoId) {
          closeFormModal();
        }
        setConfirmDeactivateId(null);
        options?.onDeactivated?.(acervoId);
      }
    },
    onError: (error) => {
      setFormError(error.message);
      setConfirmDeactivateId(null);
    }
  });

  const saving = saveMutation.isPending || toggleStatusMutation.isPending;

  function openCreateForm() {
    resetForm();
    setForm({ ...EMPTY_FORM, schoolId: schoolContextId });
    setFormError("");
    setFormModalOpen(true);
  }

  function openEditForm(acervo: AcervoResponse) {
    setEditingId(acervo.id);
    setFormError("");
    setShowValidation(false);
    setForm({
      name: decodeHtmlEntities(acervo.name),
      description: stripHtml(acervo.description) ?? "",
      status: acervo.status,
      schoolId: acervo.schoolId ?? null
    });
    setFormModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShowValidation(true);
    if (isFormInvalid) {
      setFormError("Preencha os campos obrigatorios antes de salvar.");
      return;
    }
    setFormError("");
    try {
      await saveMutation.mutateAsync({
        editingId,
        payload: {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          status: form.status,
          schoolId: form.schoolId
        }
      });
    } catch {
      // Erro ja tratado em onError (formError).
    }
  }

  function activate(acervo: AcervoResponse) {
    setFormError("");
    toggleStatusMutation.mutate({ acervoId: acervo.id, status: "1" });
  }

  function confirmDeactivate() {
    if (confirmDeactivateId === null) {
      return;
    }
    setFormError("");
    toggleStatusMutation.mutate({ acervoId: confirmDeactivateId, status: "0" });
  }

  return {
    schoolOptions,
    schoolsError,
    saving,
    formError,
    formModalOpen,
    /** Props prontas para `<AcervoFormModal {...formModalProps} />`. */
    formModalProps: {
      open: formModalOpen,
      editingId,
      form,
      isNameInvalid: showValidation && isNameInvalid,
      isSchoolInvalid: showValidation && isSchoolInvalid,
      isFormInvalid,
      saving,
      error: formError,
      schoolOptions,
      onClose: closeFormModal,
      onSubmit: handleSubmit,
      onReset: closeFormModal,
      onFormChange: setForm
    },
    openCreateForm,
    openEditForm,
    activate,
    confirmDeactivateId,
    requestDeactivate: (acervoId: number) => setConfirmDeactivateId(acervoId),
    cancelDeactivate: () => setConfirmDeactivateId(null),
    confirmDeactivate
  };
}
