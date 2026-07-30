# Role PROFESSOR — livros da escola (ativar/desativar)

**Data:** 2026-07-30  
**Status:** Aprovado — em implementacao / pronto para deploy  

## Problema

Professores precisam entrar no painel admin, ver **apenas** os livros da escola deles e **habilitar/desabilitar** esses livros — sem criar, editar capa, excluir ou acessar outros módulos. Hoje só existem `SUPER_ADMIN` e `SCHOOL_ADMIN`, com permissões amplas de catálogo.

## Decisões

| Tema | Decisão |
|------|---------|
| Quem é o professor | Login do painel (`app_admin_users`), **não** `tbl_users` |
| Role | `PROFESSOR` (role de sistema **por escola**) |
| Vínculo do professor | **Só à escola** (`app_admin_user_schools` + `school_id`) |
| Vínculo do acervo | **Só à escola** (`acervos.school_id`) — **sem** tabela admin↔acervo |
| Escopo de livros | Livros ligados a acervos da escola do contexto (já é o filtro tenant de `ListBooksUseCase`) |
| Cenário “1 acervo” | Escola de teste com **um** acervo; se a escola tiver N acervos no futuro, o professor vê livros de todos |
| Menu UI | Apenas **Livros** |
| Ações | Listar + toggle Ativo/Inativo (`status` `1`/`0`) |
| Bloqueado | create, update completo, delete, upload, autores, categorias, seções, Site, usuários, escolas, etc. |
| Permissões | `books.view` + `books.toggle_status` (nova). **Sem** `books.create` / `books.update` / `books.delete` |
| API toggle | `PATCH /api/v1/books/{id}/status` body `{ "status": "0" \| "1" }` — exige `books.toggle_status` + livro acessível na escola |
| Seed teste | Escola + 1 acervo + vínculos de livros + usuário `teste.professor` |

## Abordagens consideradas

| Abordagem | Descrição | Resultado |
|-----------|-----------|-----------|
| **A — Role PROFESSOR + escopo escola (escolhida)** | Acervo na escola; professor na escola; permissões mínimas + PATCH status | Alinha ao multi-tenant atual; sem vínculo user↔acervo |
| B — SCHOOL_ADMIN com UI restrita | Esconde botões no front | Inseguro (token ainda tem create/update) |
| C — Vínculo admin↔acervo | Tabela `app_admin_user_acervos` | Rejeitada: acervo deve ser da escola, não do usuário |

## Arquitetura

```
teste.professor ──► app_admin_users
                         │
                         ├─ role PROFESSOR (school_id = escola teste)
                         └─ app_admin_user_schools → escola teste
                                                      │
                                                      └─ acervos.school_id
                                                              │
                                                              └─ livros_acervos → tbl_books
```

### Backend

1. **Migration**  
   - Inserir permissão `books.toggle_status`  
   - Role sistema `PROFESSOR` por escola (provisionamento igual ao `SCHOOL_ADMIN`)  
   - Grants: só `books.view` + `books.toggle_status`  
   - Seed: escola `Escola Professor Teste` (slug `escola-professor-teste`), acervo `Acervo do Professor Teste`, copiar/vincular um subconjunto de livros do acervo 1 (ex. até 20) via `livros_acervos`, admin `teste.professor` / senha BCrypt `Professor@123`, role PROFESSOR, vínculo escola  

2. **`ProvisionSchoolRolesUseCase`**  
   - Ao criar escola, além de `SCHOOL_ADMIN`, criar `PROFESSOR` com as duas permissões  

3. **`BookController`**  
   - Novo `PATCH /{id}/status` → `ToggleBookStatusUseCase`  
   - `ListBooksUseCase` / `assertBookAccessible` já restringem por escola — professor herda isso via `X-School-Context` / escola única  

4. **Autorização**  
   - `books.update` **não** é concedido ao PROFESSOR (impede PUT completo)  
   - Toggle usa só `books.toggle_status`  

### Frontend

1. Nav: professor só vê item Livros (`books.view` e sem outras permissões de menu)  
2. `BooksPage` modo professor:  
   - sem botão Criar  
   - sem Editar/Excluir  
   - coluna ou ação **Ativar/Desativar** (chama PATCH)  
3. Filtro “Todos os acervos” pode permanecer (na prática 1 acervo na escola teste)

### Credenciais de teste

| Campo | Valor |
|-------|--------|
| Usuário | `teste.professor` |
| Senha | `Professor@123` |
| Escola | Escola Professor Teste |
| Acervo | Acervo do Professor Teste (único da escola) |

## Fora de escopo

- CRUD de livros pelo professor  
- Vínculo professor↔acervo  
- App leitor / Flutter  
- Módulo Site  
- Gestão de alunos pelo professor  

## Critérios de aceite

1. Login `teste.professor` entra e o menu mostra só Livros  
2. Lista contém apenas livros da escola teste (não os 93 do acervo global sem vínculo)  
3. Toggle Ativo/Inativo funciona e persiste em `tbl_books.status`  
4. `POST/PUT/DELETE /api/v1/books` retorna 403 para o professor  
5. Super admin / school admin continuam com o comportamento atual  

## Riscos

- Escola com vários acervos: professor vê todos — aceito nesta versão  
- Livros sem `livros_acervos` na escola não aparecem — esperado  
