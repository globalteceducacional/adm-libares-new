# Banco de Dados e Carga Inicial

## Decisao atual
- O projeto nao usa mais job de migracao automatizado.
- A carga de dados passa a ser feita diretamente pelo dump `u778451386_ebook.sql`.

## Fonte oficial de dados
- Arquivo: `u778451386_ebook.sql`
- Origem: dump completo exportado via phpMyAdmin/MariaDB
- Conteudo: estrutura e dados das tabelas legadas necessarias para os modulos atuais

## Como carregar o banco local
Exemplo:

```powershell
mysql -h localhost -P 3306 -u root -p adm_libare < "u778451386_ebook.sql"
```

## Observacoes importantes
- O backend atual esta focado em compatibilidade com tabelas legadas (`tbl_*`).
- Caso o dump seja atualizado, reimporte em ambiente local para refletir os dados mais recentes.
- Para evitar perda de dados, faca backup antes de uma nova importacao.

## Estrategia de evolucao
- Continuar implementando modulos sobre o schema legado.
- Quando houver necessidade real, planejar refatoracao estrutural por etapa, com recorte por modulo.

## Scripts SQL de migracao
- `scripts/migration/001_create_core_schema.sql`: cria `adm_libare_core` e tabelas com nomenclatura por dominio:
  - `app_*` (identidade/configuracoes)
  - `catalog_*` (catalogo)
  - `engagement_*` (interacoes)
  - `ops_*` (operacao/auditoria)
  - script idempotente para FKs (cria constraint somente se nao existir)
- Padrao de status nas tabelas novas:
  - `is_active` (`TINYINT(1)`) para estado ativo/inativo
  - `run_status` para estado de execucao em tabelas operacionais (`ops_*`)
- `scripts/migration/002_migrate_from_legacy.sql`: migra dados de `adm_libare` para `adm_libare_core` com `ON DUPLICATE KEY UPDATE` (idempotente).
- `scripts/migration/003_validate_migration.sql`: valida volumes, integridade e duplicidades.
- `scripts/migration/004_rollback_core_data.sql`: remove dados migrados (`legacy_*`) mantendo a estrutura da base nova.
- `scripts/migration/005_post_migration_indexes.sql`: adiciona indices extras para consultas do admin (`catalog_books`, `engagement_comments`, `app_users` e `ops_migration_runs`).
- `scripts/migration/006_smoke_test_core.sql`: executa consultas de sanity check nos modulos principais (livros, usuarios e comentarios).
- `scripts/migration/007_create_legacy_compat_views.sql`: cria views `tbl_*` sobre tabelas novas para compatibilidade com o backend atual.
- `scripts/migration/008_add_audit_triggers.sql`: triggers em `UPDATE` (campos `updated_*`) e bloqueio de `DELETE` físico nas tabelas principais de `adm_libare_core`; espera `SET @app_user_id` antes das escritas (ver backend).
- `scripts/migration/009_soft_delete_helpers.sql`: procedures padronizadas (`sp_soft_delete_*`) para exclusão lógica com `deleted_by` explícito.
- `scripts/migration/010_restore_helpers.sql`: procedures (`sp_restore_*`) para reativar registros após soft delete.
- `scripts/migration/011_audit_reports.sql`: relatórios SQL ad hoc para analistas (executar no DBeaver quando necessário).
- `scripts/migration/012_audit_views.sql`: views `vw_audit_*` (resumo por módulo, alterações recentes, soft deletes, atividade por ator, checagens de consistência).
- `scripts/migration/013_seed_permissions_audit.sql`: opcional — role MySQL `role_audit_readonly` e `GRANT SELECT` nas views de auditoria.

**Ordem recomendada após a migração base:** `008` → `009` → `010` → `012` → `013`. O `011` é independente. **Execute `012` antes de `013`** porque os grants referem-se às views.

### Auditoria no admin e API

- Painel web: rota `/auditoria` no `frontend-admin` (consome `GET /api/v1/audit/overview`).
- Disponível apenas com **`APP_DATA_MODE=core`**, base **`adm_libare_core`** e scripts **`012`** aplicados; caso contrário a API devolve `ok: false` com código em `reason`.
- O backend define `@app_user_id` na sessão MySQL via `AuditSessionContext.applyActor` antes das operações de escrita, para os triggers de `008` preencherem `updated_by`.

## Feature flag de leitura de dados
- `APP_DATA_MODE=legacy` (padrao): usa schema legado.
- `APP_DATA_MODE=core`: usa schema novo com views de compatibilidade.
- No modo `core`, o backend valida na inicializacao se as views `tbl_*` existem.

## Comparativo legado PHP x frontend novo (imagens)
- **Legado (`adm-libares`)**
  - Usuarios: o PHP renderiza foto a partir de `tbl_users.user_image`.
  - Relacao de persistencia no banco:
    - os campos de imagem (`user_image`, `author_image`, `book_cover_img`) guardam o **nome do arquivo**;
    - os arquivos fisicos ficam em `adm-libares/images` (e o legado pode gerar `images/thumbs` para preview no admin).
  - Regra observada no legado:
    - se valor vier como URL completa (`http...`), usa direto;
    - se vier somente o nome do arquivo, concatena em `images/<arquivo>`.
  - Exemplo encontrado no legado: fallback para `images/add-image.png` quando nao ha foto.
- **Frontend novo (React)**
  - Mantem a mesma logica de resolucao para evitar quebra durante a transicao.
  - Usa helper `frontend-admin/src/lib/legacyAssets.ts` para resolver URL final.
  - Usa componente `frontend-admin/src/ui/components/LegacyImage.tsx` para tratar fallback visual de erro de arquivo ausente.
  - Enquanto o bucket novo nao estiver pronto, as imagens sao servidas pelo proprio `adm-libares`.
  - Padrao temporario adotado: consumir tudo de `adm-libares/images`.
  - Autores: foto legada usa `tbl_author.author_image` com pasta `images`.

### Configuracao temporaria de assets legados
- Variavel de ambiente no frontend:
  - `VITE_LEGACY_ASSETS_BASE_URL`
- Exemplo local:
  - `VITE_LEGACY_ASSETS_BASE_URL=http://localhost/adm-libares`
- Resultado:
  - `user_image` com nome de arquivo (`abc.jpg`) -> `http://localhost/adm-libares/images/abc.jpg`
  - `user_image` com URL completa -> mantem URL original
  - `book_cover_img` com nome de arquivo (`capa.jpg`) -> `http://localhost/adm-libares/images/capa.jpg`
  - `author_image` com nome de arquivo (`autor.jpg`) -> `http://localhost/adm-libares/images/autor.jpg`
