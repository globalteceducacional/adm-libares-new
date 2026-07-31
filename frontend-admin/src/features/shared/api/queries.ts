import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listBooks, listCategoryOptions, listHomeSectionOptions } from "../../../services/booksService";
import { listAuthorOptions, listAuthors } from "../../../services/authorsService";
import { listCategories } from "../../../services/categoriesService";
import { listHomeSections } from "../../../services/homeSectionsService";
import { listAcervos, listAcervoOptions } from "../../../services/acervosService";
import { listPermissions, listRoles } from "../../../services/rolesService";
import { listSchools } from "../../../services/schoolsService";
import { getDashboardSummary } from "../../../services/dashboardService";
import { listComments } from "../../../services/commentsService";
import { listUsers } from "../../../services/usersService";
import { listTeamMembers } from "../../../services/teamService";
import { getAuditOverview } from "../../../services/auditService";
import { listSiteAuthors } from "../../../services/siteAuthorsService";
import { listSiteCategories } from "../../../services/siteCategoriesService";
import { listSiteSections } from "../../../services/siteSectionsService";
import { listSites } from "../../../services/sitesService";
import { listSiteComments } from "../../../services/siteCommentsService";

export const queryKeys = {
  books: (acervoId?: number) => (acervoId ? (["books", acervoId] as const) : (["books"] as const)),
  authors: ["authors"] as const,
  authorOptions: ["author-options"] as const,
  categories: ["categories"] as const,
  categoryOptions: ["category-options"] as const,
  homeSections: ["home-sections"] as const,
  homeSectionOptions: ["home-section-options"] as const,
  acervos: ["acervos"] as const,
  acervoOptions: ["acervo-options"] as const,
  dashboard: (periodDays: number) => ["dashboard", periodDays] as const,
  comments: ["comments"] as const,
  users: ["users"] as const,
  team: ["team"] as const,
  audit: ["audit"] as const,
  schools: ["schools"] as const,
  roles: ["roles"] as const,
  permissions: ["permissions"] as const,
  sites: ["sites"] as const,
  siteAuthors: ["site-authors"] as const,
  siteCategories: ["site-categories"] as const,
  siteSections: ["site-sections"] as const,
  siteComments: ["site-comments"] as const
};

export function getQueryErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useBooksQuery(acervoId?: number) {
  return useQuery({
    queryKey: queryKeys.books(acervoId),
    queryFn: () => listBooks(acervoId)
  });
}

export function useAuthorsQuery() {
  return useQuery({ queryKey: queryKeys.authors, queryFn: listAuthors });
}

export function useAuthorOptionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.authorOptions,
    queryFn: listAuthorOptions,
    enabled: options?.enabled ?? true
  });
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: listCategories });
}

export function useCategoryOptionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.categoryOptions,
    queryFn: listCategoryOptions,
    enabled: options?.enabled ?? true
  });
}

export function useHomeSectionsQuery() {
  return useQuery({ queryKey: queryKeys.homeSections, queryFn: listHomeSections });
}

export function useHomeSectionOptionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.homeSectionOptions,
    queryFn: listHomeSectionOptions,
    enabled: options?.enabled ?? true
  });
}

export function useAcervosQuery() {
  return useQuery({ queryKey: queryKeys.acervos, queryFn: listAcervos });
}

export function useAcervoOptionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.acervoOptions,
    queryFn: listAcervoOptions,
    enabled: options?.enabled ?? true
  });
}

export function useDashboardQuery(periodDays: 7 | 30 | 90) {
  return useQuery({
    queryKey: queryKeys.dashboard(periodDays),
    queryFn: () => getDashboardSummary(periodDays)
  });
}

export function useCommentsQuery() {
  return useQuery({ queryKey: queryKeys.comments, queryFn: listComments });
}

export function useUsersQuery(acervoId?: number) {
  return useQuery({
    queryKey: acervoId ? (["users", acervoId] as const) : queryKeys.users,
    queryFn: () => listUsers(acervoId)
  });
}

export function useTeamMembersQuery() {
  return useQuery({ queryKey: queryKeys.team, queryFn: listTeamMembers });
}

export function useAuditQuery() {
  return useQuery({ queryKey: queryKeys.audit, queryFn: getAuditOverview });
}

export function useSchoolsQuery() {
  return useQuery({ queryKey: queryKeys.schools, queryFn: listSchools });
}

export function useRolesQuery() {
  return useQuery({ queryKey: queryKeys.roles, queryFn: listRoles });
}

export function usePermissionsQuery() {
  return useQuery({ queryKey: queryKeys.permissions, queryFn: listPermissions });
}

export function useSitesQuery() {
  return useQuery({ queryKey: queryKeys.sites, queryFn: listSites });
}

export function useSiteAuthorsQuery() {
  return useQuery({ queryKey: queryKeys.siteAuthors, queryFn: listSiteAuthors });
}

export function useSiteCategoriesQuery() {
  return useQuery({ queryKey: queryKeys.siteCategories, queryFn: listSiteCategories });
}

export function useSiteSectionsQuery() {
  return useQuery({ queryKey: queryKeys.siteSections, queryFn: listSiteSections });
}

export function useSiteCommentsQuery() {
  return useQuery({ queryKey: queryKeys.siteComments, queryFn: listSiteComments });
}

export function useInvalidateAdminQueries() {
  const queryClient = useQueryClient();

  return {
    books: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
    authors: () => queryClient.invalidateQueries({ queryKey: queryKeys.authors }),
    authorOptions: () => queryClient.invalidateQueries({ queryKey: queryKeys.authorOptions }),
    categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    categoryOptions: () => queryClient.invalidateQueries({ queryKey: queryKeys.categoryOptions }),
    homeSections: () => queryClient.invalidateQueries({ queryKey: queryKeys.homeSections }),
    homeSectionOptions: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.homeSectionOptions }),
    acervos: () => queryClient.invalidateQueries({ queryKey: queryKeys.acervos }),
    acervoOptions: () => queryClient.invalidateQueries({ queryKey: queryKeys.acervoOptions }),
    comments: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments }),
    users: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    team: () => queryClient.invalidateQueries({ queryKey: queryKeys.team }),
    audit: () => queryClient.invalidateQueries({ queryKey: queryKeys.audit }),
    schools: () => queryClient.invalidateQueries({ queryKey: queryKeys.schools }),
    roles: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles }),
    permissions: () => queryClient.invalidateQueries({ queryKey: queryKeys.permissions }),
    dashboard: (periodDays: number) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(periodDays) }),
    sites: () => queryClient.invalidateQueries({ queryKey: queryKeys.sites }),
    siteAuthors: () => queryClient.invalidateQueries({ queryKey: queryKeys.siteAuthors }),
    siteCategories: () => queryClient.invalidateQueries({ queryKey: queryKeys.siteCategories }),
    siteSections: () => queryClient.invalidateQueries({ queryKey: queryKeys.siteSections }),
    siteComments: () => queryClient.invalidateQueries({ queryKey: queryKeys.siteComments })
  };
}
