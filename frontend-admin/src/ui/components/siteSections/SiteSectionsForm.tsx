import type { FormEvent } from "react";
import { useId, useMemo } from "react";
import type { UpsertSiteSectionRequest } from "../../../types/siteSections";
import { decodeHtmlEntities } from "../../../shared/lib/decodeHtmlEntities";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
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
    <FormGrid onSubmit={onSubmit}>
      <Field
        label="Titulo"
        required
        error={isTitleInvalid ? "Informe um titulo valido." : undefined}
        className="sm:col-span-2"
      >
        <Input
          type="text"
          value={form.title}
          maxLength={150}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          disabled={saving}
          invalid={isTitleInvalid}
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={saving}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Select>
      </Field>

      <FormFullWidth>
        <p id={sitesLegendId} className="mb-2 text-sm font-medium text-foreground">
          Sites da secao
        </p>
        {sitesLoading ? (
          <p className="text-xs text-muted">Carregando sites...</p>
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
      </FormFullWidth>

      <FormActions>
        <Button type="submit" disabled={saving || isTitleInvalid}>
          {saving ? "Salvando..." : editingId ? "Atualizar secao" : "Criar secao"}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
