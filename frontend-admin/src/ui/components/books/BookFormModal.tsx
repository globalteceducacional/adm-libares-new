import type { FormEvent } from "react";
import type { AcervoOptionResponse } from "../../../types/acervos";
import type {
  CategoryOptionResponse,
  HomeSectionOptionResponse,
  UpsertBookRequest
} from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";
import { Modal } from "../../../shared/ui";
import { BooksForm } from "./BooksForm";

type BookFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertBookRequest;
  authorOptions: AuthorOptionResponse[];
  acervoOptions: AcervoOptionResponse[];
  categoryOptions: CategoryOptionResponse[];
  homeSectionOptions: HomeSectionOptionResponse[];
  selectedAuthorExists: boolean;
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
  isAcervosInvalid: boolean;
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
  onFormChange: (next: UpsertBookRequest) => void;
  onCoverSelected: (file: File) => Promise<void>;
  onBookFileSelected: (file: File) => Promise<void>;
};

export function BookFormModal({
  open,
  editingId,
  form,
  authorOptions,
  acervoOptions,
  categoryOptions,
  homeSectionOptions,
  selectedAuthorExists,
  isAuthorInvalid,
  isTitleInvalid,
  isAcervosInvalid,
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
  onBookFileSelected
}: BookFormModalProps) {
  const isBusy = saving || uploadingCover || uploadingFile;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar livro" : "Novo livro"}
      description={
        editingId
          ? `Atualize os dados do livro #${editingId}.`
          : "Preencha os campos obrigatorios para publicar um novo livro no catalogo."
      }
      size="lg"
      className="max-w-3xl"
      closeOnOverlayClick={!isBusy}
    >
      <div className="book-form-modal-body">
        <BooksForm
          form={form}
          authorOptions={authorOptions}
          acervoOptions={acervoOptions}
          categoryOptions={categoryOptions}
          homeSectionOptions={homeSectionOptions}
          selectedAuthorExists={selectedAuthorExists}
          isAuthorInvalid={isAuthorInvalid}
          isTitleInvalid={isTitleInvalid}
          isAcervosInvalid={isAcervosInvalid}
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
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onCoverSelected={onCoverSelected}
          onBookFileSelected={onBookFileSelected}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
