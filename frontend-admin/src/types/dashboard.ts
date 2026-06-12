export type DashboardTotals = {
  activeBooks: number;
  inactiveBooks: number;
  featuredBooks: number;
  booksWithoutCategory: number;
  activeUsers: number;
  activeUsersLast30Days: number;
  publishedComments: number;
  commentsLast7Days: number;
  commentsPrevious7Days: number;
  totalBookViews: number;
  averageViewsPerActiveBook: number;
};

export type DashboardTopBook = {
  title: string;
  views: number;
  categoryId: string;
  categoryName: string;
};

export type DashboardTopCommenter = {
  name: string;
  commentCount: number;
};

export type DashboardCategoryCount = {
  categoryId: string;
  categoryName: string;
  bookCount: number;
};

export type DashboardDayCount = {
  day: string;
  commentCount: number;
};

export type DashboardRecentActivity = {
  module: string;
  action: string;
  user: string;
  time: string;
};

export type DashboardSummary = {
  totals: DashboardTotals;
  topBooks: DashboardTopBook[];
  topCommenters: DashboardTopCommenter[];
  booksByCategory: DashboardCategoryCount[];
  commentsByDay: DashboardDayCount[];
  recentActivities: DashboardRecentActivity[];
};
