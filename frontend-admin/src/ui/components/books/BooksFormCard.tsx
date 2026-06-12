import type { FormEvent } from "react";
import type { UpsertBookRequest } from "../../../types/books";
import type { AuthorOptionResponse } from "../../../types/authors";
import { BooksForm } from "./BooksForm";

type BooksFormCardProps = {
  editingId: number | null;
  form: UpsertBookRequest;
  authorOptions: AuthorOptionResponse[];
  selectedAuthorExists: boolean;
  isAuthorInvalid: boolean;
  isTitleInvalid: boolean;
  isFormInvalid: boolean;
  saving: boolean;
  success: string;
  error: string;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onFormChange: (next: UpsertBookRequest) => void;
};

export function BooksFormCard({
  editingId,
  form,
  authorOptions,
  selectedAuthorExists,
  isAuthorInvalid,
  isTitleInvalid,
  isFormInvalid,
  saving,
  success,
  error,
  onSubmit,
  onReset,
  onFormChange
}: BooksFormCardProps) {
  return (
    <article className="card page-card elevated">
      <div className="card-header">
        <h2>{editingId ? "Editar livro" : "Cadastrar novo livro"}</h2>
      </div>
      <BooksForm
        form={form}
        authorOptions={authorOptions}
        selectedAuthorExists={selectedAuthorExists}
        isAuthorInvalid={isAuthorInvalid}
        isTitleInvalid={isTitleInvalid}
        isFormInvalid={isFormInvalid}
        editingId={editingId}
        saving={saving}
        onSubmit={onSubmit}
        onReset={onReset}
        onChange={onFormChange}
      />
      {success ? <p className="success-text">{success}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </article>
  );
}
