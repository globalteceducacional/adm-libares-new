# ADR 0001 — Unificação CSS incremental (não big-bang)

- **Status:** Aceito
- **Data:** 2026-09-22
- **Tags:** frontend-admin, css, risco

## Contexto

O painel admin mistura Tailwind + tokens (`index.css`), um `styles.css` legado (~1.4k linhas com `book-form` / Berry / shell antigo) e um `shared/ui` parcial. Um rewrite total do CSS e de todos os formulários de uma vez aumentaria o risco de regressão em dezenas de listagens e modais já em produção (VPS).

O produto pediu melhoria ampla de CSS/forms, com levantamento e ADRs. A abordagem escolhida foi **incremental (opção A)**.

## Decisão

Conduzir a melhoria em **fases pequenas e reversíveis**:

0. Tokens e correções sem markup  
1. API canônica de form components  
2. Migração domínio a domínio  
3. Remoção de cores hardcoded (`violet-*`)  
4. Prune de CSS morto  

Cada fase deve poder ir a `main` isolada, com smoke manual das telas tocadas.

## Consequências

**Positivas**

- Menor risco de quebrar produção
- Feedback visual contínuo
- Dívida paga de forma mensurável

**Negativas**

- Período com duas APIs de botão/form (`primary-btn` e `Button`)
- Exige disciplina: código novo não pode reintroduzir `book-form`

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Big-bang (reescrever `styles.css` e todos os forms) | Alto risco de regressão; QA longo; bloqueia outras entregas |
| Só documentação sem plano de fases | Não reduz dívida; não guia PRs |
| Adotar MUI/shadcn agora | Custo de migração alto; já existe Berry + shared/ui suficiente |
