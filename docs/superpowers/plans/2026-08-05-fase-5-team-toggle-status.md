# Fase 5 — Toggle status da Equipe (API + UI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir Ativar/Desativar membros da equipe no painel, espelhando Sites (`PATCH .../status` + `*.toggle_status`).

**Architecture:** Nova permission `team.toggle_status`, use case que atualiza `app_admin_users.status`, UI com botão Ativar/Desativar na listagem. Não desativar o próprio usuário logado nem SUPER_ADMIN.

**Tech Stack:** Kotlin/Spring + Flyway V24; React `frontend-admin`.

---

### Task 1: Backend

- [x] DTO `ToggleTeamMemberStatusRequest`
- [x] `TeamPolicy.requireToggleStatus`
- [x] `ToggleTeamMemberStatusUseCase`
- [x] `PATCH /api/v1/admin-users/{id}/status` em `AdminUserController`
- [x] Migration `V24__TeamToggleStatusPermission.kt`

### Task 2: Frontend

- [x] `toggleTeamMemberStatus` em `teamService`
- [x] `TeamPage`: botões + permission gate + toast
- [ ] (opcional) `TeamMemberDetailModal` — adiado

### Task 3: Verificação

- [x] Compile backend / `tsc` frontend
