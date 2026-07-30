# Equipe vs Usuários — leitores do app e staff do painel

**Data:** 2026-07-30  
**Status:** Aprovado (design) — aguardando plano de implementação  

## Problema

O formulário **Criar usuário** em `/usuarios` pede **acervo** e não tem **perfil** nem **escola**, o que parece incompleto. Na verdade há **dois tipos de pessoa**:

| Conceito | Tabela | Cadastro hoje |
|----------|--------|----------------|
| Leitor do app | `tbl_users` | `/usuarios` — acervo + escola via `X-School-Context` |
| Staff do painel | `app_admin_users` | Subform em `/escolas` só cria `SCHOOL_ADMIN`; **não há create de PROFESSOR** nem listagem de equipe |

O gap de produto é a falta de um fluxo claro de **Equipe** (escola + perfil) separado de **Usuários do app** (acervo + contexto de escola).

## Decisões

| Tema | Decisão |
|------|---------|
| Separação | **Usuários** = só leitores; **Equipe** = só staff do painel |
| Onde fica Equipe | Nova página no menu (**Sistema → Equipe**, rota `/equipe`) |
| Subform em Escolas | **Removido** da UI (“Criar admin da escola”) |
| Quem cria SCHOOL_ADMIN | Equipe de **desenvolvimento / SUPER** (plataforma) via Equipe |
| Quem cria PROFESSOR | **SCHOOL_ADMIN** (só esse perfil) |
| Quem SCHOOL_ADMIN cria em Usuários | Continua podendo criar **leitores** (nome, email, senha, telefone, acervo, status) |
| PROFESSOR | **Não cria** ninguém (nem leitor, nem staff); sem acesso a Equipe/Usuários |
| Escola no create de leitor | Contexto do painel (`X-School-Context`), exibida no form (somente leitura) |
| Escola no create de staff | Campo escola no form Equipe (SUPER escolhe; SCHOOL_ADMIN: só escolas vinculadas) |
| Perfil no create de staff | SUPER: `SCHOOL_ADMIN` ou `PROFESSOR`; SCHOOL_ADMIN: só `PROFESSOR` (fix fixo ou select com uma opção) |
| Escopo desta entrega | Listar + criar equipe; **sem** editar/desativar/excluir membros |
| Multi-escola no create | Um `schoolId` por create |
| Vínculo professor | Continua só escola (`app_admin_user_schools`); **sem** admin↔acervo |

## Abordagens consideradas

| Abordagem | Descrição | Resultado |
|-----------|-----------|-----------|
| **1 — Página Equipe + API admin-users (escolhida)** | Nav Equipe; GET/POST `/api/v1/admin-users`; UX Usuários esclarecida; remove subform Escolas | Separação clara; regras de perfil auditáveis |
| 2 — Tudo dentro de Escolas | Estender `POST /schools/{id}/admins` com role | Escolas sobrecarregada; gap de UX persiste |
| 3 — Só frontend no create antigo | Reusar create de escolas + seed | Sem listagem; PROFESSOR sem API limpa |

## Arquitetura

```
SUPER ──► Equipe: cria SCHOOL_ADMIN | PROFESSOR
SCHOOL_ADMIN ──► Equipe: cria só PROFESSOR
             └──► Usuários: cria leitor (tbl_users + acervo da escola)
PROFESSOR ──► sem create de usuários/equipe (só livros + toggle)
```

### Backend

1. **Permissões**  
   - Novas: `team.view`, `team.create`  
   - Conceder a SUPER e a roles `SCHOOL_ADMIN` (por escola) via migration + `ProvisionSchoolRolesUseCase`  
   - **Não** conceder a `PROFESSOR`  
   - Create de leitor continua em `users.create` (SCHOOL_ADMIN já tem; PROFESSOR não)

2. **API** (`AdminUserController` / use cases novos)  
   - `GET /api/v1/admin-users` — lista staff (filtro por escola / contexto; SUPER pode ver amplo)  
   - `POST /api/v1/admin-users` — body: `username`, `password`, `name`, `schoolId`, `roleCode` (`SCHOOL_ADMIN` \| `PROFESSOR`)  
   - Autorização no use case:  
     - exige `team.create`  
     - se caller é SCHOOL_ADMIN → `roleCode` deve ser `PROFESSOR` e `schoolId` ∈ escolas do caller  
     - se caller é SUPER → permite `SCHOOL_ADMIN` e `PROFESSOR`  
     - se caller é PROFESSOR → 403  
   - Persistência: `app_admin_users` + `app_admin_user_roles` (role da escola) + `app_admin_user_schools`  
   - Username duplicado → 400; escola inexistente → 400; role inválida → 400  

3. **`POST /api/v1/schools/{schoolId}/admins`**  
   - Remover da UI. Endpoint pode permanecer temporariamente (compat) ou delegar ao mesmo use case com `roleCode=SCHOOL_ADMIN` e mesma policy de SUPER — preferência: **não expandir** esse endpoint; novos creates só em `/admin-users`.

4. **Leitores**  
   - `CreateUserUseCase` inalterado na regra de negócio (escola do tenant + acervo da escola).  
   - Garantir que PROFESSOR não tem `users.create` (já é o caso no provisionamento atual).

### Frontend

1. **Nav** — item **Equipe** (`/equipe`) com gate `team.view` (grupo Sistema).  
2. **EquipePage** — listagem + modal criar (padrão Berry/modal do projeto).  
   - SCHOOL_ADMIN: botão “Criar professor”; perfil/escola restritos.  
   - SUPER: “Criar membro”; select perfil SCHOOL_ADMIN | PROFESSOR + escola.  
3. **UsersPage / CreateUserForm** — copy “Usuários do app” / “Criar leitor”; exibir escola do contexto (readonly); manter acervo.  
4. **SchoolsPage** — remover subform “Criar admin da escola”.  
5. PROFESSOR — sem itens Equipe/Usuários na nav (sem permissões).

### Erros e mensagens

- 403: tentativa de SCHOOL_ADMIN criar SCHOOL_ADMIN, ou PROFESSOR em team/users create  
- 400: validação (senha curta, username existente, acervo/escola inválidos)  
- UI: mensagens genéricas amigáveis; sem expor estrutura interna

## Testes mínimos

| Caso | Esperado |
|------|----------|
| SUPER cria SCHOOL_ADMIN | 201 |
| SUPER cria PROFESSOR | 201 |
| SCHOOL_ADMIN cria PROFESSOR na própria escola | 201 |
| SCHOOL_ADMIN tenta criar SCHOOL_ADMIN | 403 |
| SCHOOL_ADMIN cria leitor em Usuários (acervo da escola) | 201 |
| PROFESSOR chama create equipe ou users | 403 |
| PROFESSOR não vê Equipe/Usuários na nav | OK |

## Fora de escopo

- Editar, desativar ou excluir membros da equipe  
- Atribuir várias escolas no mesmo create  
- UI de impersonate / gestão global além do necessário para SUPER listar/criar  
- Mudança no modelo professor↔acervo (já definido na spec PROFESSOR)

## Critério de sucesso

- Gap da UI resolvido: Usuários = leitor + acervo; Equipe = escola + perfil com as regras acima  
- SCHOOL_ADMIN não cria outro admin; professor não cria ninguém  
- SCHOOL_ADMIN ainda cadastra leitores do app normalmente  

## Relação com outras specs

- Complementa `2026-07-30-professor-books-toggle-design.md` (perfil PROFESSOR e permissões de livros)  
- Não altera o vínculo professor → só escola / acervo → escola  
