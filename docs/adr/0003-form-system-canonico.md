# ADR 0003 — Sistema canônico de formulários (`shared/ui`)

- **Status:** Aceito
- **Data:** 2026-09-22
- **Tags:** frontend-admin, forms, a11y

## Contexto

Existem três “linguagens” de form:

1. `shared/ui`: `Field`, `Input`, `Button`, `Alert` — bons em a11y (`aria-invalid`, `role="alert"`)
2. Legado: `.book-form`, `.form-field`, `.primary-btn` / `.secondary-btn`
3. Berry: `BerrySelect`, `BerryFormPanel` + classes `berry-*`

A maioria dos CRUDs ainda usa o legado. Labels, alturas, validação e botões divergem. Já há decisão de produto de cadastros em **FormModal** ([spec](../superpowers/specs/2026-08-06-sistema-form-modals-design.md)); falta unificar o *conteúdo* dos forms.

## Decisão

**API canônica para qualquer formulário novo ou migrado:**

| Peça | Componente |
|------|------------|
| Campo com label/erro | `Field` (`Feedback.tsx` ou extrair `Field.tsx`) |
| Texto / email / password | `Input` |
| Ações | `Button` (`variant` primary/secondary/…) |
| Container do form em modal | grid utilitário ou futuro `FormGrid` |
| Select simples | novo `Select` shared (absorve `BerrySelect`) |
| Combobox busca | `SearchableSelect` (mantido; estilos alinhados a tokens) |
| Multi-check | `SearchableCheckboxList` (mantido) |
| Shell do modal | `Modal` |

Regras:

- Código **novo** não pode introduzir `primary-btn`, `secondary-btn` ou markup `book-form` sem justificativa na PR.
- Validação visível passa por `Field` `error` / `Alert`, não só `small.warning-text` solto.
- Preferir `useId` + `htmlFor` nos forms migrados.

## Consequências

**Positivas**

- A11y e UX de erro consistentes
- Menos CSS específico por form
- Onboarding mais simples (“sempre shared/ui”)

**Negativas**

- Esforço de migração em ~15+ `*Form.tsx`
- `SearchableSelect` ainda misturará classes até Fase 2/3

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Padronizar tudo em `book-form` (legado como canônico) | Pior a11y; trava Tailwind; diametralmente oposto ao shared/ui já usado |
| React Hook Form + schema agora | Útil depois; não resolve tokens/CSS; escopo maior que o necessário na Fase 1 |
| Headless UI/Radix obrigatório | Só justificar se Select/combobox portal falhar; não bloquear unificação |
