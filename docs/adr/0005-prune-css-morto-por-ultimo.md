# ADR 0005 — Podar CSS morto por último

- **Status:** Aceito
- **Data:** 2026-09-22
- **Tags:** frontend-admin, css, cleanup

## Contexto

`styles.css` contém shell antigo (`.app-shell`, `.sidebar`, `.menu-link`, `.login-card`, etc.) sem referências em TSX, além de regras ainda usadas por `book-form`, DataTable mobile, SearchableSelect e Berry listing.

Apagar blocos cedo demais quebra forms ainda não migrados.

## Decisão

1. **Não** fazer prune agressivo na Fase 0/1.
2. Após cada domínio migrado (ADR 0004), remover apenas seletores **comprovadamente órfãos** (grep zero em `src/**/*.{tsx,ts,css}`).
3. Fase 4 dedicada: remover shell legado e media queries órfãs; reduzir `styles.css` com checklist.
4. Manter `.berry-table`, listing e o que ainda for referenciado até haver substituto Tailwind explícito.
5. Incluir nas listagens restantes (`Schools`, `Roles`, `Games`) `renderMobileCard` nesta fase (ou PR irmã), pois não depende de apagar CSS.

## Consequências

**Positivas**

- Evita “CSS sumiu e o form quebrou”
- Cleanup mensurável no fim
- Permite convívio controlado legado/moderno

**Negativas**

- Arquivo grande permanece por mais tempo
- Tentação de “já que estou aqui, apago tudo” — vetada por esta ADR

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Apagar metade de `styles.css` na Fase 0 | Alto risco; forms legado ainda dependem |
| Ignorar CSS morto para sempre | Ruído, conflitos e medo de tocar no arquivo |
| Reescrever DataTable/Berry em Tailwind agora | Escopo paralelo; pode seguir depois sem bloquear forms |
