# ADR 0002 — Tokens de design em fonte única

- **Status:** Aceito
- **Data:** 2026-09-22
- **Tags:** frontend-admin, design-tokens, dark-mode

## Contexto

`main.tsx` importa `index.css` e depois `styles.css`. Ambos definem `:root` / `:root.dark`.

- `index.css`: `--primary: #673ab7`, `--primary-rgb: 103 58 183` (Berry / Tailwind `bg-primary`)
- `styles.css`: `--primary: #5e35b1`, `--bg: #f4f7ff` (sobrescreve o anterior)

Há ainda referências a variáveis inexistentes (`--muted`, `--foreground`) e muitas classes Tailwind `violet-*` / `indigo-*` que ignoram tokens — dark mode fica inconsistente.

## Decisão

1. **`src/index.css` é a única fonte de tokens** (`:root` e `:root.dark`).
2. Remover o bloco `:root` / `:root.dark` de `styles.css` (e backgrounds de `body` duplicados, consolidando no `@layer base` de `index.css`).
3. Manter paleta Berry canônica: primary `#673ab7` / rgb `103 58 183`.
4. Em fases seguintes, preferir `bg-primary`, `text-primary`, `border-border`, etc., em vez de `violet-*` / `indigo-*`.
5. Corrigir vars fantasma para `--text-muted` / `--text` (ou aliases explícitos se necessário para compat).

## Consequências

**Positivas**

- Uma verdade para cores e dark mode
- Tailwind e CSS legado alinham no mesmo primary
- Mudanças de marca/tema ficam localizadas

**Negativas**

- Possível micro-diferença visual imediata (`#5e35b1` → `#673ab7`) — aceitável e desejada (Berry)
- Exige smoke de Login, Sidebar, botões e listagens após Fase 0

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Manter dois `:root` e “conviver” | Continua bug de cascade; Tailwind e legado divergem |
| Mover todos os tokens só para `tailwind.config.js` | Perde CSS vars úteis ao legado `styles.css` restante |
| Introduzir CSS-in-JS / theme provider | Overhead sem ganho; stack atual já é CSS vars + Tailwind |
