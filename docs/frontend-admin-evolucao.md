# Evolucao do frontend-admin (painel React)

Documento de referencia do trabalho de modernizacao da UI, filtros, autenticacao e integracao com o backend Kotlin.

## 1. Layout e listagens

- Padronizacao das telas **Livros**, **Usuarios**, **Comentarios** e **Autores** com cartoes `page-card elevated`, toolbar de busca/filtro e `DataTable`.
- Animacao de entrada com **Framer Motion** (`books-page-stack`).
- **Dashboard**, **Auditoria** e **Login** alinhados ao mesmo visual (cartoes elevados, login com `motion.form`).

## 2. Componentes reutilizaveis

| Componente | Funcao |
|------------|--------|
| `AdminListingSection` | Listagem generica: busca, filtro de status opcional, tabela, paginacao, rodape, mensagens de erro/sucesso |
| `BooksFormCard` + `BooksForm` | Formulario criar/editar livro |
| `LegacyImage` | Capas/avatares com fallback e URL legada |
| `DataTable` | Tabela responsiva com cards mobile e paginacao |

## 3. Filtros na URL

- Hook **`useAdminListFilters`**: sincroniza `q` (busca) e `status` com a query string (`replace: true`).
- Autores: apenas `q` (`syncStatus: false`).
- Tipo **`AdminStatusFilter`** em `src/types/adminList.ts`.

## 4. Paginacao

- Ativada por defeito em `AdminListingSection` (`paginate`, 20 linhas, opcoes 10/20/50/100).
- Paginacao **client-side** sobre dados ja filtrados.

## 5. Feedback ao utilizador

- Hook **`useTimedMessage`**: mensagens de sucesso temporarias (~2,6 s).
- **Usuarios** e **Comentarios**: sucesso ao ativar/desativar, publicar/ocultar e excluir.
- **Livros**: sucesso no cartao do formulario (criar/editar/excluir).
- Erro na listagem **nao esconde mais a tabela** (correcao em `AdminListingSection`).

## 6. Autenticacao e API

- **`auth.ts`**: validacao de formato JWT; limpeza de token invalido no `localStorage`.
- **`api.ts`**: `401` e `403` redirecionam para login; base URL vazia usa **proxy do Vite** em dev.
- **Login**: credenciais por defeito `admin` / `password` (README); validacao do token apos login.

## 7. Assets legados (capas)

- **`legacyAssets.ts`**: normaliza base para incluir `/legacy/assets` quando a env aponta so para o host.
- Backend: `WebSecurityCustomizer` ignora `/legacy/assets/**` (sem JWT em `<img>`).

## 8. Desenvolvimento local

### Frontend

```powershell
cd frontend-admin
npm install
npm run dev
```

Abrir `http://localhost:5173`. O Vite faz proxy de `/api`, `/legacy` e `/actuator` para `http://localhost:8080`.

Stack completa (Windows):

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\start-dev.ps1"
```

Opcional em `.env`: `VITE_API_BASE_URL=http://localhost:8080` (se nao usar proxy).

### Backend

```powershell
cd backend
$env:DB_PASSWORD = "root"   # ajustar conforme MySQL local
.\gradlew.bat bootRun
```

### MySQL (Docker)

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\local\start-db.ps1"
```

Requer Docker Desktop no PATH.

## 9. Ficheiros principais alterados

```
frontend-admin/src/ui/components/layout/AdminListingSection.tsx
frontend-admin/src/ui/components/books/BooksFormCard.tsx
frontend-admin/src/ui/components/books/BooksForm.tsx
frontend-admin/src/hooks/useAdminListFilters.ts
frontend-admin/src/hooks/useTimedMessage.ts
frontend-admin/src/lib/api.ts
frontend-admin/src/lib/auth.ts
frontend-admin/src/lib/legacyAssets.ts
frontend-admin/vite.config.ts
backend/.../shared/security/SecurityConfig.kt
scripts/local/start-db.ps1
```

## 10. Problemas comuns

| Sintoma | Causa provavel | Acao |
|---------|----------------|------|
| `ERR_CONNECTION_REFUSED` :8080 | Backend parado | `gradlew bootRun` ou `docker compose up` |
| `403` na API | JWT ausente/invalido | Logout, login de novo; limpar `adm_libare_access_token` |
| `403` em imagens | URL sem `/legacy/assets` | Atualizar front; reiniciar backend com `SecurityConfig` |
| MySQL `Access denied` | Senha errada | `DB_PASSWORD` ou `application-local.yml` |
| Public Key Retrieval | JDBC sem parametro | URL com `allowPublicKeyRetrieval=true` (ja no `application.yml`) |
