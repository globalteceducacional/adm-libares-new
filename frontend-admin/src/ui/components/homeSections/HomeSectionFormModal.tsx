import type { FormEvent } from "react";
import type { UpsertHomeSectionRequest } from "../../../types/homeSections";
import { Modal } from "../../../shared/ui";
import { HomeSectionsForm } from "./HomeSectionsForm";

type BookOption = {
  id: number;
  title: string;
};

type HomeSectionFormModalProps = {
  open: boolean;
  editingId: number | null;
  form: UpsertHomeSectionRequest;
  isTitleInvalid: boolean;
  needsSchoolContext: boolean;
  booksLoading: boolean;
  activeBooks: BookOption[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertHomeSectionRequest) => void;
  onToggleBook: (bookId: number) => void;
};

export function HomeSectionFormModal({
  open,
  editingId,
  form,
  isTitleInvalid,
  needsSchoolContext,
  booksLoading,
  activeBooks,
  saving,
  error,
  onClose,
  onSubmit,
  onReset,
  onFormChange,
  onToggleBook
}: HomeSectionFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? "Editar seção" : "Nova seção"}
      description={
        editingId
          ? `Atualize a seção #${editingId} e os livros vinculados.`
          : "Defina o titulo, status e os livros que aparecem nesta seção da home."
      }
      size="xl"
      className="max-w-4xl"
      closeOnOverlayClick={!saving}
    >
      <div className="book-form-modal-body max-h-[70vh] overflow-y-auto pr-1">
        <HomeSectionsForm
          form={form}
          editingId={editingId}
          saving={saving}
          isTitleInvalid={isTitleInvalid}
          needsSchoolContext={needsSchoolContext}
          booksLoading={booksLoading}
          activeBooks={activeBooks}
          inModal
          onSubmit={onSubmit}
          onReset={onReset}
          onChange={onFormChange}
          onToggleBook={onToggleBook}
        />
        {error ? <p className="error-text mt-3">{error}</p> : null}
      </div>
    </Modal>
  );
}
