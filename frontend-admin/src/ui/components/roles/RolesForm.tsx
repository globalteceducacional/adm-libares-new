import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { UpsertRoleRequest } from "../../../types/roles";
import {
  Button,
  Field,
  FormActions,
  FormFullWidth,
  FormGrid,
  Input,
  Select
} from "../../../shared/ui";
import { cn } from "../../../shared/lib/cn";

type PermissionItem = {
  id: string;
  label: string;
  description: string;
};

type RolesFormProps = {
  form: UpsertRoleRequest;
  editingId: number | null;
  saving: boolean;
  isNameInvalid: boolean;
  isPermissionsInvalid: boolean;
  isEditingSystemRole: boolean;
  needsSchoolContext: boolean;
  canSubmit: boolean;
  permissionItems: PermissionItem[];
  canManageRoles: boolean;
  inModal?: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onReset: () => void;
  onChange: (next: UpsertRoleRequest) => void;
  onTogglePermission: (code: string) => void;
};

/** Human-readable module name map */
const MODULE_LABELS: Record<string, string> = {
  books: "Livros",
  users: "Usuários",
  reports: "Relatórios",
  roles: "Funções",
  settings: "Configurações",
  comments: "Comentários",
  acervos: "Acervos",
  authors: "Autores",
  categories: "Categorias",
  sections: "Seções",
  notifications: "Notificações",
  audit: "Auditoria",
  platform: "Plataforma",
  dashboard: "Dashboard",
  schools: "Contratos",
  games: "Jogos",
  sites: "Sites",
  outros: "Outros"
};

function moduleLabel(mod: string): string {
  return MODULE_LABELS[mod] ?? (mod.charAt(0).toUpperCase() + mod.slice(1));
}

function extractModule(code: string): string {
  const idx = code.indexOf(".");
  return idx >= 0 ? code.slice(0, idx) : "outros";
}

export function RolesForm({
  form,
  editingId,
  saving,
  isNameInvalid,
  isPermissionsInvalid,
  isEditingSystemRole,
  needsSchoolContext,
  canSubmit,
  permissionItems,
  canManageRoles,
  inModal = false,
  onSubmit,
  onReset,
  onChange,
  onTogglePermission
}: RolesFormProps) {
  const fieldsDisabled = isEditingSystemRole || needsSchoolContext;
  const [permSearch, setPermSearch] = useState("");

  /** Group permissions by module */
  const groups = useMemo(() => {
    const searchLower = permSearch.trim().toLowerCase();
    const filtered = searchLower
      ? permissionItems.filter(
          (p) =>
            p.id.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        )
      : permissionItems;

    const map = new Map<string, PermissionItem[]>();
    for (const item of filtered) {
      const mod = extractModule(item.id);
      if (!map.has(mod)) {
        map.set(mod, []);
      }
      map.get(mod)!.push(item);
    }
    // Sort modules alphabetically by their label
    return [...map.entries()].sort((a, b) =>
      moduleLabel(a[0]).localeCompare(moduleLabel(b[0]), "pt-BR")
    );
  }, [permissionItems, permSearch]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  function toggleGroupCollapse(mod: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) {
        next.delete(mod);
      } else {
        next.add(mod);
      }
      return next;
    });
  }

  const isSearching = permSearch.trim().length > 0;

  return (
    <FormGrid onSubmit={onSubmit}>
      <Field
        label="Nome"
        required
        error={isNameInvalid ? "Informe um nome valido." : undefined}
      >
        <Input
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          disabled={fieldsDisabled}
          invalid={isNameInvalid}
        />
      </Field>

      <Field label="Status">
        <Select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          disabled={fieldsDisabled}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </Select>
      </Field>

      <FormFullWidth>
        <p className="mb-2 text-sm font-medium text-foreground">Permissoes</p>

        {/* Search input for permissions */}
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={permSearch}
            onChange={(e) => setPermSearch(e.target.value)}
            placeholder="Buscar permissão por código ou descrição..."
            className="h-9 w-full rounded-xl border border-border bg-surface pl-8 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            disabled={fieldsDisabled || !canManageRoles}
          />
        </div>

        {/* Grouped permission list */}
        <div
          className={cn(
            "rounded-xl border border-border bg-surface-2/40 overflow-y-auto",
            "max-h-[340px]"
          )}
        >
          {groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {isSearching ? "Nenhuma permissão encontrada para esta busca." : "Nenhuma permissão disponível."}
            </p>
          ) : (
            groups.map(([mod, items]) => {
              const isCollapsed = !isSearching && collapsedGroups.has(mod);
              const allChecked = items.every((p) => form.permissionCodes.includes(p.id));
              const someChecked = items.some((p) => form.permissionCodes.includes(p.id));

              return (
                <div key={mod} className="border-b border-border last:border-0">
                  {/* Module header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-2/80">
                    {/* Select-all checkbox for the module */}
                    {!isEditingSystemRole && canManageRoles ? (
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = !allChecked && someChecked;
                        }}
                        onChange={() => {
                          if (allChecked) {
                            items.forEach((p) => {
                              if (form.permissionCodes.includes(p.id)) onTogglePermission(p.id);
                            });
                          } else {
                            items.forEach((p) => {
                              if (!form.permissionCodes.includes(p.id)) onTogglePermission(p.id);
                            });
                          }
                        }}
                        disabled={fieldsDisabled || !canManageRoles}
                        className="h-3.5 w-3.5 shrink-0 accent-primary"
                        title={`Selecionar/deselecionar todas as permissões de ${moduleLabel(mod)}`}
                      />
                    ) : null}
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-left"
                      onClick={() => !isSearching && toggleGroupCollapse(mod)}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                        {moduleLabel(mod)}
                      </span>
                      <span className="text-xs text-muted">({items.length})</span>
                      {!isSearching ? (
                        <ChevronDown
                          size={14}
                          className={cn(
                            "ml-auto text-muted transition-transform",
                            isCollapsed && "-rotate-90"
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </div>

                  {/* Permission items */}
                  {!isCollapsed ? (
                    <ul className="divide-y divide-border/50">
                      {items.map((item) => {
                        const checked = form.permissionCodes.includes(item.id);
                        return (
                          <li key={item.id}>
                            <label className={cn(
                              "flex cursor-pointer items-start gap-3 px-3 py-2 text-sm transition-colors",
                              !fieldsDisabled && canManageRoles && "hover:bg-surface-2/60",
                              (fieldsDisabled || !canManageRoles) && "cursor-default opacity-70"
                            )}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onTogglePermission(item.id)}
                                disabled={fieldsDisabled || !canManageRoles}
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block font-mono text-xs text-foreground">{item.id}</span>
                                <span className="block text-xs text-muted">{item.description}</span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {isPermissionsInvalid ? (
          <p className="mt-2 text-xs text-danger" role="alert">
            Selecione ao menos uma permissão.
          </p>
        ) : null}
      </FormFullWidth>

      <FormActions>
        {canSubmit ? (
          <Button type="submit" disabled={saving || needsSchoolContext || isNameInvalid}>
            {saving ? "Salvando..." : editingId ? "Salvar perfil" : "Criar perfil"}
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>
          {isEditingSystemRole ? "Fechar" : inModal ? "Cancelar" : "Limpar formulario"}
        </Button>
      </FormActions>
    </FormGrid>
  );
}
