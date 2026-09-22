# Fase 2a — Migrar Acervos / Schools / Categories / Authors (+ Site*)

**Status:** implementado (local)  
**Goal:** Trocar `book-form`/`primary-btn` por FormGrid + Field + Input/Select/Textarea/Button nestes domínios.

## Arquivos

- `shared/ui/Form.tsx` — adiciona `Textarea`
- `acervos/AcervosForm.tsx`
- `schools/SchoolsForm.tsx`
- `categories/CategoriesForm.tsx`
- `siteCategories/SiteCategoriesForm.tsx`
- `authors/AuthorsForm.tsx`
- `siteAuthors/SiteAuthorsForm.tsx`

## Commit (manual)

```powershell
git add frontend-admin/src/shared/ui/Form.tsx frontend-admin/src/shared/ui/index.ts frontend-admin/src/ui/components/acervos/AcervosForm.tsx frontend-admin/src/ui/components/schools/SchoolsForm.tsx frontend-admin/src/ui/components/categories/CategoriesForm.tsx frontend-admin/src/ui/components/siteCategories/SiteCategoriesForm.tsx frontend-admin/src/ui/components/authors/AuthorsForm.tsx frontend-admin/src/ui/components/siteAuthors/SiteAuthorsForm.tsx docs/superpowers
git commit -m "feat(admin): migrar forms Acervos/Schools/Categories/Authors para shared/ui"
```
