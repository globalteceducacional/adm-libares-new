package com.libare.adm.modules.dashboard.api.dto

data class DashboardSummaryResponse(
    val totals: DashboardTotalsDto,
    val topBooks: List<DashboardTopBookDto>,
    val topCommenters: List<DashboardTopCommenterDto>,
    val booksByCategory: List<DashboardCategoryCountDto>,
    val commentsByDay: List<DashboardDayCountDto>,
    val recentActivities: List<DashboardRecentActivityDto>,
)

data class DashboardTotalsDto(
    val activeBooks: Long,
    val inactiveBooks: Long,
    val featuredBooks: Long,
    val booksWithoutCategory: Long,
    val activeUsers: Long,
    val activeUsersLast30Days: Long,
    val publishedComments: Long,
    val commentsLast7Days: Long,
    val commentsPrevious7Days: Long,
    val totalBookViews: Long,
    val averageViewsPerActiveBook: Double,
)

data class DashboardTopBookDto(
    val title: String,
    val views: Long,
    val categoryId: String,
    val categoryName: String,
)

data class DashboardTopCommenterDto(
    val name: String,
    val commentCount: Long,
)

data class DashboardCategoryCountDto(
    val categoryId: String,
    val categoryName: String,
    val bookCount: Long,
)

data class DashboardDayCountDto(
    val day: String,
    val commentCount: Long,
)

data class DashboardRecentActivityDto(
    val module: String,
    val action: String,
    val user: String,
    val time: String,
)
