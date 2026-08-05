import type { FormEvent } from "react";
import type { UpsertSiteRequest } from "../../../types/sites";
import type { SiteAuthorResponse } from "../../../types/siteAuthors";
import type { SiteCategoryResponse } from "../../../types/siteCategories";
import { Modal } from "../../../shared/ui";
import { SitesForm } from "./SitesForm";

type SiteFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertSiteRequest;
  authorOptions: SiteAuthorResponse[];
  categoryOptions: SiteCategoryResponse[];
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
  isCategoriesInvalid: boolean;
  isDescriptionInvalid: boolean;
  isCoverInvalid: boolean;
  isFileInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  uploadingCover: boolean;
  uploadingFile: boolean;
  uploadError: string;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertSiteRequest) => void;
  onCoverSelected: (file: File) => Promise<void>;
  onSiteFileSelected: (file: File) => Promise<void>;
};

export function SiteFormModal({
  open,
  editingId,
  form,
  authorOptions,
  categoryOptions,
  isAuthorInvalid,
  isTitleInvalid,
  isCategoriesInvalid,
  isDescriptionInvalid,
  isCoverInvalid,
  isFileInvalid,
  isFormInvalid,
  saving,
  uploadingCover,
  uploadingFile,
  uploadError,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange,
  onCoverSelected,
  onSiteFileSelected
}: SiteFormModalProps) {
  const isBusy = saving || uploadingCover || uploadingFile;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar site" : "Novo site"}
      description={
        editingId
          ? `Atualize os dados do site #${editingId}.`
          : "Preencha categorias, autor, titulo, descricao, capa e arquivo."
      }
      size="xl"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <SitesForm
          form={form}
          authorOptions={authorOptions}
          categoryOptions={categoryOptions}
          isAuthorInvalid={isAuthorInvalid}
          isTitleInvalid={isTitleInvalid}
          isCategoriesInvalid={isCategoriesInvalid}
          isDescriptionInvalid={isDescriptionInvalid}
          isCoverInvalid={isCoverInvalid}
          isFileInvalid={isFileInvalid}
          isFormInvalid={isFormInvalid}
          editingId={editingId}
          saving={saving}
          uploadingCover={uploadingCover}
          uploadingFile={uploadingFile}
          uploadError={uploadError}
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onCoverSelected={onCoverSelected}
          onSiteFileSelected={onSiteFileSelected}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
