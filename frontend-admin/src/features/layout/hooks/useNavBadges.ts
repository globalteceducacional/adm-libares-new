import { useMemo } from "react";
import {
  useAcervosQuery,
  useAuthorOptionsQuery,
  useBooksQuery,
  useCategoryOptionsQuery,
  useCommentsQuery,
  useHomeSectionOptionsQuery,
  useUsersQuery
} from "../../shared/api/queries";
import type { NavBadgeKey } from "../config/navigation";

export type NavBadgeMap = Partial<Record<NavBadgeKey, number>>;

/** Contagens dinamicas para badges do menu (TanStack Query). */
export function useNavBadges(): NavBadgeMap {
  const books = useBooksQuery();
  const authors = useAuthorOptionsQuery();
  const categories = useCategoryOptionsQuery();
  const homeSections = useHomeSectionOptionsQuery();
  const acervos = useAcervosQuery();
  const users = useUsersQuery();
  const comments = useCommentsQuery();

  return useMemo(
    () => ({
      books: books.data?.length,
      authors: authors.data?.length,
      categories: categories.data?.length,
      homeSections: homeSections.data?.length,
      acervos: acervos.data?.length,
      users: users.data?.length,
      comments: comments.data?.length
    }),
    [
      books.data?.length,
      authors.data?.length,
      categories.data?.length,
      homeSections.data?.length,
      acervos.data?.length,
      users.data?.length,
      comments.data?.length
    ]
  );
}
