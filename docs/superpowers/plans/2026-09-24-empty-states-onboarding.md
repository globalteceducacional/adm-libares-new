# Plano — Empty states com CTA + checklist de contrato novo

Spec: [2026-09-24-empty-states-onboarding-design.md](../specs/2026-09-24-empty-states-onboarding-design.md)

- [x] `shared/ui/EmptyState.tsx` (ícone, título, descrição, ação botão/link, ação secundária)
- [x] `DataTable` / `AdminListingSection`: prop `emptyState` (desktop + mobile)
- [x] `AcervosPage`: empty state "Criar primeiro acervo" + `?new=1` abre o form
- [x] `BooksPage`: empty state geral e "acervo sem livros" → hub
- [x] `UsersPage`: empty state geral e "acervo sem leitores" → hub (aba leitores)
- [x] Abas Livros/Leitores do hub: empty state com CTA "Adicionar…"
- [x] `OnboardingChecklist` no Dashboard (3 passos, progresso, dismiss em localStorage, gated por `acervos.view`)
- [x] `tsc -b`, `vite build`

## Pendências fora do código
- Validar visualmente com um contrato vazio (dashboard, `/acervos`, `/livros?acervoId=X`).
