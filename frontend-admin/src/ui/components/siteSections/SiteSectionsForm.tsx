import type { FormEvent } from "react";
import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import type { UpsertSiteSectionRequest } from "../../../types/siteSections";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import { SearchableCheckboxList } from "../form/SearchableCheckboxList";

type SiteOption = {
  id: number;
  title: string;
};

type SiteSectionsFormProps = {
  form: UpsertSiteSectionRequest;
  editingId: number | null;
  saving: boolean;
  isTitleInvalid: boolean;
  sitesLoading: boolean;
  activeSites: SiteOption[];
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertSiteSectionRequest) => void;
  onToggleSite: (siteId: number) => void;
};

export function SiteSectionsForm({
  form,
  editingId,
  saving,
  isTitleInvalid,
  sitesLoading,
  activeSites,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onToggleSite
}: SiteSectionsFormProps) {
  const titleId = useId();
  const titleErrorId = `${titleId}-error`;
  const statusId = useId();
  const sitesLegendId = useId();

  const siteItems = useMemo(
    () =>
      activeSites.map((site) => ({
        id: site.id,
        label: `#${site.id} ${decodeHtmlEntities(site.title)}`
      })),
    [activeSites]
  );

  return (
    <form className="book-form modern" onSubmit={onSubmit} noValidate>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field" htmlFor={titleId}>
          <span>Titulo</span>
          <input
            id={titleId}
            type="text"
            value={form.title}
            maxLength={150}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            required
            aria-invalid={isTitleInvalid || undefined}
            aria-describedby={isTitleInvalid ? titleErrorId : undefined}
          />
          {isTitleInvalid ? (
            <small id={titleErrorId} role="alert" className="warning-text">
              Informe um titulo valido.
            </small>
          ) : null}
        </label>
        <label className="form-field" htmlFor={statusId}>
          <span>Status</span>
          <select
            id={statusId}
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value })}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend id={sitesLegendId}>Sites da seção</legend>
        {sitesLoading ? (
          <small className="form-hint">Carregando sites...</small>
        ) : (
          <SearchableCheckboxList
            items={siteItems}
            selectedIds={form.siteIds}
            onToggle={onToggleSite}
            searchPlaceholder="Buscar site por titulo ou ID..."
            tall
            disabled={saving}
            emptyMessage="Nenhum site ativo disponivel."
            aria-labelledby={sitesLegendId}
          />
        )}
      </fieldset>

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving}
        >
          {saving ? "Salvando..." : editingId ? "Atualizar seção" : "Criar seção"}
        </motion.button>
        <button className="secondary-btn" type="button" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </button>
      </div>
    </form>
  );
}
