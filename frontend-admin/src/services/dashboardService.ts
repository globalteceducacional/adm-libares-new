import { apiRequest } from "../lib/api";
import type { DashboardSummary, DashboardTotals } from "../types/dashboard";

const EMPTY_TOTALS: DashboardTotals = {
  activeBooks: 0,
  inactiveBooks: 0,
  featuredBooks: 0,
  booksWithoutCategory: 0,
  activeUsers: 0,
  activeUsersLast30Days: 0,
  publishedComments: 0,
  commentsLast7Days: 0,
  commentsPrevious7Days: 0,
  totalBookViews: 0,
  averageViewsPerActiveBook: 0
};

function normalizeSummary(raw: DashboardSummary): DashboardSummary {
  return {
    totals: { ...EMPTY_TOTALS, ...raw.totals },
    topBooks: raw.topBooks ?? [],
    topCommenters: raw.topCommenters ?? [],
    booksByCategory: raw.booksByCategory ?? [],
    commentsByDay: raw.commentsByDay ?? [],
    recentActivities: raw.recentActivities ?? []
  };
}

export function getDashboardSummary(periodDays: 7 | 30 | 90): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>(`/api/v1/dashboard/summary?periodDays=${periodDays}`).then(normalizeSummary);
}
