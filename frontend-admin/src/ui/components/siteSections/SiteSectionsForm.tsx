import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { UpsertSiteSectionRequest } from "../../../types/siteSections";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";

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
  return (
    <form className="book-form modern" onSubmit={onSubmit}>
      <fieldset className="form-field acervo-fieldset">
        <legend>Identificacao</legend>
        <label className="form-field">
          <span>Titulo</span>
          <input
            type="text"
            value={form.title}
            maxLength={150}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            required
          />
          {isTitleInvalid ? <small className="warning-text">Informe um titulo valido.</small> : null}
        </label>
        <label className="form-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value })}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="form-field acervo-fieldset">
        <legend>Sites</legend>
        <div className="form-field">
          <span>Sites da seção</span>
          {sitesLoading ? (
            <small className="form-hint">Carregando sites...</small>
          ) : activeSites.length === 0 ? (
            <small className="form-hint">Nenhum site ativo disponivel.</small>
          ) : (
            <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeSites.map((site) => (
                <label key={site.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 accent-primary"
                    checked={form.siteIds.includes(site.id)}
                    onChange={() => onToggleSite(site.id)}
                    disabled={saving}
                  />
                  <span>
                    <span className="font-medium">#{site.id}</span> {decodeHtmlEntities(site.title)}
                  </span>
                </label>
              ))}
            </div>
          )}
          <small className="form-hint">{form.siteIds.length} site(s) selecionado(s)</small>
        </div>
      </fieldset>

      <div className="book-form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          type="submit"
          disabled={saving || isTitleInvalid}
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
