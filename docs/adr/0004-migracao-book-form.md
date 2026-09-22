# ADR 0004 — Deprecar `book-form` / migrar por domínio

- **Status:** Aceito
- **Data:** 2026-09-22
- **Tags:** frontend-admin, forms, migracao

## Contexto

Dezenas de `*Form.tsx` compartilham o esqueleto `book-form` + `form-field` + `book-form-actions` + `motion.button.primary-btn`. Migrar tudo num único PR é frágil. Forms grandes (Books, Sites) têm upload, featured toggle e checkbox lists.

## Decisão

1. Tratar `book-form` / `form-field` / `primary-btn` / `secondary-btn` como **deprecated**.
2. Migrar **um domínio por PR**, nesta ordem:
   1. Users + Team (a11y fraca, ganho rápido)
   2. Acervos, Schools, Categories e espelhos Site*
   3. Authors, HomeSections, SiteSections
   4. Roles (híbrido)
   5. Books, Sites (último)
3. Durante a transição, alias CSS opcional pode mapear `.book-form` → layout equivalente, mas o destino é markup `Field`/`Input`/`Button`.
4. Não misturar prune grande de `styles.css` na mesma PR da migração de um form complexo.

## Consequências

**Positivas**

- Review e rollback por domínio
- Progresso visível no painel
- Books/Sites só depois que o padrão estiver estável

**Negativas**

- Tempo calendário maior
- Grep ainda encontra classes legado até o fim da Fase 2

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Migrar todos os forms num único PR | Diff enorme; regressão difícil de isolar |
| Só wrapper visual sem trocar componentes | Não melhora a11y nem API |
| Começar por Books/Sites | Maior complexidade; atrasa aprendizado do padrão |
