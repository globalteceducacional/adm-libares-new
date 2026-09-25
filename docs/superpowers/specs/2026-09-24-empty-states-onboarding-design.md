# Empty states com CTA + checklist de contrato novo — design

- **Data:** 2026-09-24
- **Status:** Aprovado (escolhido no brainstorming de melhorias do front)
- **Relacionado:** Hub do acervo (2026-09-24-acervo-hub-design.md), ADR 0006

## Problema

Um contrato recém-criado abre o painel e vê tabelas vazias com "Nenhum registro encontrado".
Não há indicação da ordem correta (acervo → livros → leitores) nem atalho para o próximo passo.

## Decisão

### 1. `EmptyState` (shared/ui)

Componente único: ícone, título, descrição, ação primária (botão) e ação secundária (link).
`DataTable` ganha `emptyState?: ReactNode`, renderizado no lugar de `emptyMessage` (desktop e mobile)
quando a lista está vazia. `AdminListingSection` repassa a prop.

Regra de uso: a página passa `emptyState` **só quando a lista bruta está vazia e não há filtro ativo**;
com filtro ativo continua a mensagem "Nenhum X para os filtros aplicados".

Aplicado em: Acervos, Livros, Usuários (fluxo principal) e nas abas Livros/Leitores do hub.
Quando a página de Livros/Usuários está filtrada por um acervo vazio, o empty state aponta para o hub.

### 2. `OnboardingChecklist` (dashboard)

Derivado apenas de `useAcervosQuery()` (já filtrado pelo contexto do contrato):

| Passo | Concluído quando | CTA |
|---|---|---|
| Criar o primeiro acervo | `acervos.length > 0` | `/acervos?new=1` (abre o form) |
| Vincular livros ao acervo | algum `bookCount > 0` | `/acervos/{primeiroAcervo}` |
| Cadastrar leitores | algum `userCount > 0` | `/acervos/{primeiroAcervo}?tab=leitores` |

- Exibido no topo do Dashboard enquanto houver passo pendente; some sozinho quando tudo concluído.
- Botão "Ocultar" grava em `localStorage` (`adm-onboarding-dismissed:{schoolContextId|global}`).
- CTA só aparece se o usuário tem a permissão (`acervos.create`, `acervos.update`, `users.update`);
  sem permissão o passo fica descritivo.
- Escopo: reflete o contrato selecionado no topo; na visão global soma todos os contratos.

### 3. `?new=1` em `/acervos`

`AcervosPage` abre o formulário de criação ao montar se `new=1` estiver na URL e o usuário tiver
`acervos.create`; remove o parâmetro em seguida (replace) para não reabrir ao voltar.

## Fora de escopo

Checklist persistido no backend, passos além do trio acervo/livros/leitores, empty states das
páginas de Site/Sistema (podem adotar `EmptyState` depois sem mudança estrutural).

## Verificação

`tsc -b`, `vite build`; revisão manual: dashboard com contrato vazio, `/acervos` vazio,
`/livros?acervoId=X` com acervo vazio.
