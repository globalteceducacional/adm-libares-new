# Usuários — editar perfil (nome, email, telefone)

**Data:** 2026-08-06  
**Status:** aprovado; plano em `docs/superpowers/plans/2026-08-06-usuarios-editar-perfil.md`  
**Escopo:** backend + `frontend-admin` — leitores (`tbl_users` / `/usuarios`)

## Problema

Leitores podem ser criados, ativados/desativados, ter acervo alterado e excluídos. Nome, email e telefone no detalhe são somente leitura; não existe endpoint de update de perfil.

## Decisões de produto

- Editar **nome, email e telefone** apenas.
- **Sem** foto, senha, alteração de `userType` nesta entrega.
- UI: **FormModal** (abordagem A), com botão Editar na linha e no DetailModal.
- Preferência: FormModal também para **criar** (alinhar a Escolas), removendo `BerryFormPanel` de cadastro se couber no mesmo PR.

## API

### `PUT /api/v1/users/{userId}`

**Auth:** JWT admin + `users.update` + tenant escola (mesmo padrão de `UpdateUserAcervoUseCase`).

**Body (`UpdateUserProfileRequest`):**

```json
{
  "name": "string (obrigatorio)",
  "email": "string (obrigatorio)",
  "phone": "string (obrigatorio)"
}
```

**Regras:**
- Trim em todos os campos.
- Email único case-insensitive, **excluindo** o próprio `userId`.
- Não altera `password`, `userImage`, `acervoId`, `status`, `schoolId`.
- `404` se usuário inexistente / fora do escopo; `400` se email duplicado ou validação; `403` se sem permissão/tenant.

**Response:** `200` + `UserResponse` atualizado.

## Frontend

| Peça | Comportamento |
|------|----------------|
| `UserFormModal` + form | Create e edit; edit sem campo senha (ou senha opcional ausente) |
| CTA **Novo usuario** | Abre modal create |
| **Editar** (linha + DetailModal) | Preenche form; submit → `PUT` |
| DetailModal | Mantém acervo / ativar / excluir; adiciona botão Editar |
| Sucesso | Fecha modal, invalidate users, toast |

Tipos: `UpdateUserProfileRequest`; service `updateUserProfile(userId, payload)`.

## Critérios de pronto

- [ ] `PUT /api/v1/users/{id}` implementado e coberto por teste de use case (ou IT existente do módulo, se houver padrão)
- [ ] UI permite editar nome/email/telefone via FormModal
- [ ] Email duplicado de outro usuário rejeitado
- [ ] Acervo/status/delete inalterados em comportamento
- [ ] `npx tsc --noEmit` no frontend-admin; backend compila

## Fora de escopo

- Reset/alteração de senha  
- Upload/edição de avatar  
- Edição de membros da Equipe (`admin-users`)  
- Busca server-side de usuários
