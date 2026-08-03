# Sites — modal de CRUD + PROFESSOR (ativar/desativar)

**Data:** 2026-08-03  
**Status:** Design — implementar / revisar working tree e deploy  
**Relacionado:** `2026-07-23-site-module-design.md`, `2026-07-30-professor-books-toggle-design.md`

## Problema

1. A tela **Sites** ainda usava formulário inline (`BerryFormPanel`); o padrão desejado (como Livros) é **criar/editar em modal**.  
2. O role **PROFESSOR** já ativa/desativa **livros**; o mesmo comportamento é necessário para **conteúdos Site** (listar + toggle status), sem CRUD completo.

## Decisões

| Tema | Decisão |
|------|---------|
| UX create/edit | Modal (`SiteFormModal` + form), botão “Novo site” no hero; sem painel inline |
| Quem é o professor | Mesmo `app_admin_users` / role `PROFESSOR` por escola |
| Escopo de dados Site | **Global** (sem `school_id` / acervo) — igual ao módulo Site legado |
| Menu UI (professor) | Apenas item **Sites** (`/sites`) — **não** Autores / Categorias / Seções / Comentários |
| Ações (professor) | Listar + **Ativar/Desativar** (`status` `1`/`0`) |
| Bloqueado (professor) | create, update completo, delete, upload, autores/categorias/seções/comentários Site |
| Permissões novas/uso | `sites.view` + `sites.toggle_status`. **Sem** `sites.create` / `sites.update` / `sites.delete` / `sites.comments.*` |
| API toggle | `PATCH /api/v1/sites/{id}/status` body `{ "status": "0" \| "1" }` — exige `sites.toggle_status` |
| Nav Autores/Categorias/Seções | Continuar com `sites.view` para admins; professor **não** recebe `sites.view` em itens extras via permissão dedicada — ajustar nav para exigir `sites.update` (ou equivalente) nos itens que não sejam a listagem Sites, **ou** gate por `sites.create`/`sites.update` nos subitens |
| Gate nav recomendado | `/sites` → `sites.view`; `/sites/autores|categorias|secoes` → `sites.update`; comentários → `sites.comments.view` (inalterado) |

## Abordagens (menu professor)

| | Descrição | Resultado |
|---|-----------|-----------|
| **A — Só Sites (escolhida)** | Nav secundária exige `sites.update`; professor só vê Sites | Espelho do padrão Livros |
| B — Grupo Site inteiro em leitura | Autores/Categorias/Seções com `sites.view` | Menu poluído; risco de confusão |

## Arquitetura

```
PROFESSOR
  perms: books.view, books.toggle_status,
         sites.view, sites.toggle_status
       │
       ├─ /livros  → list + PATCH books/{id}/status
       └─ /sites   → list + PATCH sites/{id}/status
                     (catalogo Site global — sem filtro escola)
```

### Backend

1. **Migration `V20__SiteToggleStatusForProfessor`**  
   - Inserir `sites.toggle_status`  
   - Grant `sites.view` + `sites.toggle_status` a roles `PROFESSOR` (por escola)  
   - Grant `sites.toggle_status` a `SUPER_ADMIN` (e, se desejado, `SCHOOL_ADMIN` via provisionamento amplo)  

2. **`ProvisionSchoolRolesUseCase`**  
   - Role `PROFESSOR` nova escola: incluir `sites.view` + `sites.toggle_status` junto com books.*  

3. **`ToggleSiteStatusUseCase` + `SitePolicy.requireToggleStatus()`**  
   - Não exigir `sites.update`  

4. **`SiteController`**  
   - `PATCH /{siteId}/status`  

### Frontend

1. **`SiteFormModal` + `SitesForm`** — create/edit em modal (padrão `BookFormModal`)  
2. **`SitesPage`**  
   - `professorMode = sites.toggle_status && !sites.update && !sites.create`  
   - Sem “Novo site” / Editar / Excluir no modo professor  
   - Ação Ativar/Desativar chama `toggleSiteStatus`  
3. **Nav** — subitens Site (autores/categorias/seções) gated com `sites.update` para esconder do professor  

## Credenciais de teste

| Campo | Valor |
|-------|--------|
| Usuário | `teste.professor` |
| Senha | `Professor@123` |
| Esperado menu | Livros + Sites |
| Sites | Lista global; só toggle status |

## Critérios de aceite

1. Create/edit de Site abrem em **modal** (não form inline)  
2. Login professor: menu mostra **Livros** e **Sites** (não autores/categorias/seções Site)  
3. Toggle Ativo/Inativo em Sites persiste `Sites.status`  
4. `POST/PUT/DELETE /api/v1/sites` → **403** para professor  
5. `PATCH /api/v1/sites/{id}/status` → **200** com `sites.toggle_status`  
6. SUPER / SCHOOL_ADMIN mantêm CRUD completo em modal  

## Fora de escopo

- Multi-tenant em Site  
- Professor criar/editar Site  
- Modal nas outras telas Site (Autores/Categorias/Seções) nesta entrega  
- Mudanças no Flutter / `api_sites.php`  

## Riscos

- Catálogo Site é global: professor vê **todos** os sites, não só “da escola” — aceito (paridade com o domínio Site)  
- VPS precisa Flyway **V20** + rebuild frontend/backend  
