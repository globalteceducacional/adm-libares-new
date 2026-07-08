import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listBooks } from "../../../services/booksService";
import { listAuthorOptions, listAuthors } from "../../../services/authorsService";
import { listCategories, listCategoryOptions } from "../../../services/categoriesService";
import { getDashboardSummary } from "../../../services/dashboardService";
import { listComments } from "../../../services/commentsService";
import { listUsers } from "../../../services/usersService";
import { getAuditOverview } from "../../../services/auditService";

export const queryKeys = {
  books: ["books"] as const,
  authors: ["authors"] as const,
  authorOptions: ["author-options"] as const,
  categories: ["categories"] as const,
  categoryOptions: ["category-options"] as const,
  dashboard: (periodDays: number) => ["dashboard", periodDays] as const,
  comments: ["comments"] as const,
  users: ["users"] as const,
  audit: ["audit"] as const
};

export function getQueryErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useBooksQuery() {
  return useQuery({ queryKey: queryKeys.books, queryFn: listBooks });
}

export function useAuthorsQuery() {
  return useQuery({ queryKey: queryKeys.authors, queryFn: listAuthors });
}

export function useAuthorOptionsQuery() {
  return useQuery({ queryKey: queryKeys.authorOptions, queryFn: listAuthorOptions });
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: listCategories });
}

export function useCategoryOptionsQuery() {
  return useQuery({ queryKey: queryKeys.categoryOptions, queryFn: listCategoryOptions });
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

export function useUsersQuery() {
  return useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
}

export function useAuditQuery() {
  return useQuery({ queryKey: queryKeys.audit, queryFn: getAuditOverview });
}

export function useInvalidateAdminQueries() {
  const queryClient = useQueryClient();

  return {
    books: () => queryClient.invalidateQueries({ queryKey: queryKeys.books }),
    authors: () => queryClient.invalidateQueries({ queryKey: queryKeys.authors }),
    authorOptions: () => queryClient.invalidateQueries({ queryKey: queryKeys.authorOptions }),
    categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    categoryOptions: () => queryClient.invalidateQueries({ queryKey: queryKeys.categoryOptions }),
    comments: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments }),
    users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    audit: () => queryClient.invalidateQueries({ queryKey: queryKeys.audit }),
    dashboard: (periodDays: number) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(periodDays) })
  };
}
