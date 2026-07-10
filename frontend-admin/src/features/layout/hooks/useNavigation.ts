import { useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  filterNavBySearch,
  filterNavigation,
  type NavBadgeKey
} from "../config/navigation";
import { useNavBadges } from "./useNavBadges";

export function useNavigation(searchQuery = "") {
  const { permissions, isSuperAdmin } = useAuth();
  const badges = useNavBadges();

  const groups = useMemo(() => {
    const filtered = filterNavigation(permissions, isSuperAdmin);
    return filterNavBySearch(filtered, searchQuery);
  }, [permissions, isSuperAdmin, searchQuery]);

  function getBadge(itemBadgeKey?: NavBadgeKey): number | undefined {
    if (!itemBadgeKey) {
      return undefined;
    }
    const value = badges[itemBadgeKey];
    return value && value > 0 ? value : undefined;
  }

  return { groups, badges, getBadge };
}
