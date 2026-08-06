# Sistema — cadastros em FormModal

**Data:** 2026-08-06  
**Status:** aprovado em conversa (escopo opção 1); aguardando revisão do arquivo  
**Escopo:** frontend-admin — seção Sistema (Escolas, Equipe, Perfis)

## Problema

Escolas (`/escolas`), Equipe (`/equipe`) e Perfis (`/perfis`) ainda usam formulário inline (`BerryFormPanel`) ao lado da listagem. O restante do admin (Categorias, Autores, Acervos, Site*, Livros, etc.) usa **FormModal** para criar/editar. Isso gera UX e layout inconsistentes.

## Fora de escopo

- Auditoria (`/auditoria`) — sem cadastro
- DetailModal / clique na linha para detalhe
- Usuários (não está no menu Sistema)
- Mudanças de API/backend
- Migração residual de `useAdminMutation` em Books/Sites

## Decisão de produto

**Somente FormModal** (criar/editar). Sem DetailModal nesta entrega.

## UX

1. Página = listagem em largura total (hero + stats + tabela).
2. Remover `BerryFormPanel` das três telas.
3. CTA **Novo** (PermissionGate) abre modal de criação.
4. Ação **Editar** na linha abre modal preenchido (Escolas e Perfis).
5. Equipe: modal só para **criação** (como hoje); Ativar/Desativar permanece nas ações da linha.
6. Sucesso no save → fecha modal e limpa estado do formulário.
7. Cancelar / fechar overlay → mesma limpeza (`closeFormModal`).
8. Manter `useAdminMutation`, validação pós-submit, toasts e permissões atuais.

## Padrão técnico (espelhar Categorias)

Referência: `CategoryFormModal` + `CategoriesForm` (`inModal`) + `CategoriesPage` (`formModalOpen`, `openCreateForm`, `handleEdit`, `closeFormModal`).

| Tela | Form | Modal | Observação |
|------|------|-------|------------|
| Escolas | `schools/SchoolsForm.tsx` | `SchoolFormModal.tsx` | create + update; size `md`/`lg` |
| Equipe | Reusar `CreateTeamMemberForm` + `inModal` | `TeamFormModal.tsx` | só create |
| Perfis | `roles/RolesForm.tsx` | `RoleFormModal.tsx` | create + update; size `xl` (lista de permissões) |

Páginas: `SchoolsPage`, `TeamPage`, `RolesPage` — orquestram estado e mutations; formulário visual só no modal.

## Critérios de pronto

- [ ] Nas três rotas, não há formulário de cadastro/edição inline
- [ ] Novo e Editar (onde existir) abrem FormModal
- [ ] Layout alinhado às outras listagens (sem coluna de form)
- [ ] `npx tsc --noEmit` no frontend-admin passa

## Abordagem descartada

- Envolver JSX atual em `<Modal>` sem extrair Form (B) — page continua inchada
- Modal genérico único “Sistema” (C) — campos e fluxos muito diferentes
