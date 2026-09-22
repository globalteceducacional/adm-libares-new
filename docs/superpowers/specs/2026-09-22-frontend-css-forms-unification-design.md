# Unificação CSS e formulários — frontend-admin

**Data:** 2026-09-22  
**Status:** Fases 0–4 implementadas (local); aguarda commit/deploy  
**Abordagem aprovada:** incremental (opção A)  
**ADRs:** [docs/adr/](../../adr/README.md)

## 1. Objetivo

Eliminar a concorrência entre três camadas de UI no painel admin, sem rewrite big-bang:

1. Tokens Tailwind canônicos (`index.css`)
2. CSS legado Berry + `book-form` (`styles.css` ~1.4k linhas)
3. Design system parcial (`shared/ui`: Field, Input, Button, Modal)

Resultado esperado: visual consistente, formulários acessíveis e previsíveis, CSS menor e mantível.

## 2. Levantamento — estado atual

### 2.1 Arquitetura CSS

| Camada | Arquivo | Problema |
|--------|---------|----------|
| Tokens canônicos | `src/index.css` | `--primary: #673ab7` + `--primary-rgb` |
| Tokens sobrescritos | `src/styles.css` `:root` | `--primary: #5e35b1`, `--bg` diferente — **vence no cascade** |
| Tailwind | `tailwind.config.js` | Cores via CSS vars; `primary` usa `--primary-rgb` |
| Legado shell | `.app-shell`, `.sidebar`, `.menu-link` | Sem uso em TSX (layout já é Tailwind) |
| Forms legado | `.book-form`, `.form-field`, `.primary-btn` | Maioria dos CRUDs |
| Berry listing | `.berry-*` | Listagens maduras; manter por enquanto |

### 2.2 Formulários

| Padrão | Onde |
|--------|------|
| `Field` + `Input` + `Button` | Login, Settings, Notifications, Games (parcial), Roles (parcial) |
| `book-form` + `form-field` + `primary-btn` | Books, Sites, Authors, Users, Team, Acervos, Schools, Categories, Site*, HomeSections |
| Híbrido | RolesForm |

Clones quase idênticos: Acervos, Authors, Categories, SiteAuthors, SiteCategories, HomeSections, SiteSections, Schools.

### 2.3 Inconsistências críticas

- Altura/radius de input: 42px/10px (`form-field`) vs `h-10`/`rounded-xl` (`Input`)
- Botões: gradiente `.primary-btn` vs `Button` flat com `bg-primary`
- Validação: `Field.error` + `aria-invalid` vs `warning-text` / `error-text` ad hoc
- Cores: `violet-*` / `indigo-*` hardcoded (Login, Topbar, Dashboard, BerryFormPanel)
- Vars fantasma em `styles.css`: `var(--muted)`, `var(--foreground)` (não existem nos tokens)
- Listagens sem `renderMobileCard`: Schools, Roles, Games, Audit (UX mobile inferior)

### 2.4 O que já está bom (preservar)

- `ListingPageShell` + `AdminListingSection` + `DataTable`
- `Modal` com focus trap / Esc / restore
- `SearchableSelect` com listbox ARIA
- Shell `AppLayout` com scroll isolado (menu vs conteúdo)
- Dark mode via `themeStore` + classe `dark` no `html`

## 3. Fora de escopo (nesta iniciativa)

- Migrar para MUI / shadcn / Radix como dependência obrigatória
- Redesign de marca (nova paleta fora Berry `#673ab7`)
- Backend / contratos de API
- App Flutter / reader
- Bottom nav mobile (ficou como ideia futura no Berry redesign)

## 4. Design — fases incrementais

### Fase 0 — Fundações (sem mudar markup dos CRUDs) ✅ implementada (local)

1. Remover `:root` / `:root.dark` duplicados de `styles.css` (fonte única = `index.css`)
2. Corrigir `var(--muted)` / `var(--foreground)` → tokens reais
3. Garantir `html/body/#root` height sem conflito entre os dois CSS
4. Documentar regra: **novo código só usa `shared/ui` + tokens**

**Critério de pronto:** visual estável (smoke nas listagens principais); sem regressão óbvia de cor.  
**Plano:** [2026-09-22-fase-0-tokens-css.md](../plans/2026-09-22-fase-0-tokens-css.md)

### Fase 1 — API canônica de formulário ✅ implementada (local)

1. Exportar/estabilizar: `Field`, `Input`, `Button`, `Select`, `FormGrid`, `FormActions`
2. `FormGrid` + `FormActions` (substituem semanticamente `book-form` / `book-form-actions`)
3. Migrar **Users** + **Team** como primeiros consumidores (ADR 0004)
4. `BerrySelect` passa a usar `Select` shared (filtros de listagem)

**Critério de pronto:** Login/Settings já no padrão; Users/Team migrados; tsc ok.  
**Plano:** [2026-09-22-fase-1-form-system-users-team.md](../plans/2026-09-22-fase-1-form-system-users-team.md)

### Fase 2 — Migração de forms restantes (página a página)

Ordem sugerida (menor → maior risco):

1. ~~Users + Team~~ ✅
2. ~~Acervos, Schools, Categories (+ Site*) + Authors/SiteAuthors~~ ✅
3. ~~HomeSections, SiteSections~~ ✅
4. ~~Roles (híbrido)~~ ✅
5. ~~Books, Sites~~ ✅

**Fase 2 concluída (local):** todos os `*Form.tsx` de domínio migrados para FormGrid/Field/Button.

Cada PR: um domínio, screenshot/smoke, sem misturar prune grande de CSS.

### Fase 3 — Tokens na UI shell ✅ implementada (local)

- Trocar `violet-*` / `indigo-*` por `primary` / tokens em Topbar, Sidebar, Login, DashboardStatCard, PageHeroStrip, BerryFormPanel, Games

### Fase 4 — CSS morto + mobile gaps ✅ implementada (local)

- Remover shell legado (`.app-shell`, `.sidebar` antigo, `.menu-link`, `.login-card`, `.primary-btn`, media 940px)
- `renderMobileCard` em Schools, Roles, Games
- SitesPage CTA → `Button` shared

**Iniciativa CSS/forms:** Fases 0–4 concluídas localmente.

## 5. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Regressão visual em 15+ listagens | Fases pequenas; não apagar `styles.css` de uma vez |
| Duas APIs de botão durante transição | Regra de lint/convenção; preferir `Button`; alias CSS temporário |
| SearchableSelect acoplado a `.form-field` | Migrar estilos para tokens na Fase 1/2, não reescrever comportamento |
| Dark mode inconsistente | Tokens únicos primeiro; depois remover hardcoded Tailwind |

## 6. Critérios de sucesso (iniciativa completa)

- [x] Um único `:root` de tokens (`index.css`) — Fase 0
- [x] Nenhum form novo usando `primary-btn` / `book-form` — Fase 1/2 (forms de domínio migrados)
- [x] ≥80% dos `*Form.tsx` em Field/Input/Button (ou FormGrid) — Fase 2
- [x] `styles.css` reduzido sem classes shell mortas — Fase 4
- [x] Smoke mobile nas listagens críticas (Schools/Roles/Games + demais) — Fase 4
- [x] `npx tsc -b` ok
- [x] UI shell sem `violet-*`/`indigo-*` hardcoded — Fase 3

## 7. Próximo passo após aprovação deste doc

1. Revisar ADRs em `docs/adr/`
2. Abrir plano de implementação (fase 0) via writing-plans
3. Executar Fase 0 no código

## 8. Referências

- [Berry frontend redesign](./2026-07-03-berry-frontend-redesign.md)
- [Sistema form modals](./2026-08-06-sistema-form-modals-design.md)
- [Evolução frontend-admin](../../frontend-admin-evolucao.md)
- ADRs: [001](../../adr/0001-unificacao-css-incremental.md) … [005](../../adr/0005-prune-css-morto-por-ultimo.md)
