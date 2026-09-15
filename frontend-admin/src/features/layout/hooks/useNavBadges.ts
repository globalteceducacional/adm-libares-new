import { useMemo } from "react";
import {
  useAcervosQuery,
  useAuthorOptionsQuery,
  useBooksQuery,
  useCategoryOptionsQuery,
  useCommentsQuery,
  useGamesQuery,
  useHomeSectionOptionsQuery,
  useUsersQuery
} from "../../shared/api/queries";
import { usePermission } from "../../auth/usePermission";
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
  // Jogos e opcional na base legada; sem permissao a chamada retornaria 403.
  const games = useGamesQuery({ enabled: usePermission("games.view") });

  return useMemo(
    () => ({
      books: books.data?.length,
      authors: authors.data?.length,
      categories: categories.data?.length,
      homeSections: homeSections.data?.length,
      acervos: acervos.data?.length,
      users: users.data?.length,
      comments: comments.data?.length,
      games: games.data?.length
    }),
    [
      books.data?.length,
      authors.data?.length,
      categories.data?.length,
      homeSections.data?.length,
      acervos.data?.length,
      users.data?.length,
      comments.data?.length,
      games.data?.length
    ]
  );
}
