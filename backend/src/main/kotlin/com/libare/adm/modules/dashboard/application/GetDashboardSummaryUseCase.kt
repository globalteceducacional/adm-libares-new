package com.libare.adm.modules.dashboard.application

import com.libare.adm.modules.dashboard.api.dto.DashboardCategoryCountDto
import com.libare.adm.modules.dashboard.api.dto.DashboardDayCountDto
import com.libare.adm.modules.dashboard.api.dto.DashboardRecentActivityDto
import com.libare.adm.modules.dashboard.api.dto.DashboardSummaryResponse
import com.libare.adm.modules.dashboard.api.dto.DashboardTopBookDto
import com.libare.adm.modules.dashboard.api.dto.DashboardTopCommenterDto
import com.libare.adm.modules.dashboard.api.dto.DashboardTotalsDto
import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class GetDashboardSummaryUseCase(
    private val jdbc: JdbcTemplate,
    @Value("\${app.data.mode:legacy}") private val dataMode: String,
) {
    fun execute(periodDays: Int?): DashboardSummaryResponse {
        // O modo legacy usa as tabelas tbl_* (schema PHP original); o modo core usa o schema novo.
        return if (dataMode.trim().lowercase() == "core") {
            executeCore(periodDays)
        } else {
            executeLegacy(periodDays)
        }
    }

    private fun executeCore(periodDays: Int?): DashboardSummaryResponse {
        val selectedPeriodDays = normalizePeriodDays(periodDays)
        val activeBooks = count("SELECT COUNT(*) FROM catalog_books WHERE deleted_at IS NULL AND is_active = 1")
        val inactiveBooks = count("SELECT COUNT(*) FROM catalog_books WHERE deleted_at IS NULL AND is_active = 0")
        val featuredBooks = count("SELECT COUNT(*) FROM catalog_books WHERE deleted_at IS NULL AND is_active = 1 AND is_featured = 1")
        val booksWithoutCategory = count("SELECT COUNT(*) FROM catalog_books WHERE deleted_at IS NULL AND is_active = 1 AND category_id IS NULL")
        val activeUsers = count("SELECT COUNT(*) FROM app_users WHERE deleted_at IS NULL AND is_active = 1")
        val activeUsersLast30Days = count(
            """
            SELECT COUNT(DISTINCT l.user_id)
            FROM app_user_activity_logs l
            INNER JOIN app_users u ON u.id = l.user_id
            WHERE l.deleted_at IS NULL
              AND u.deleted_at IS NULL
              AND u.is_active = 1
              AND l.created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val publishedComments = count("SELECT COUNT(*) FROM engagement_comments WHERE deleted_at IS NULL AND is_active = 1")
        val commentsLast7Days = count(
            """
            SELECT COUNT(*)
            FROM engagement_comments
            WHERE deleted_at IS NULL
              AND is_active = 1
              AND commented_at_epoch IS NOT NULL
              AND FROM_UNIXTIME(commented_at_epoch) >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val commentsPrevious7Days = count(
            """
            SELECT COUNT(*)
            FROM engagement_comments
            WHERE deleted_at IS NULL
              AND is_active = 1
              AND commented_at_epoch IS NOT NULL
              AND FROM_UNIXTIME(commented_at_epoch) >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${selectedPeriodDays * 2} DAY)
              AND FROM_UNIXTIME(commented_at_epoch) < DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val totalBookViews = count(
            "SELECT COALESCE(SUM(views), 0) FROM catalog_books WHERE deleted_at IS NULL AND is_active = 1"
        )
        val averageViewsPerActiveBook = countDecimal(
            """
            SELECT COALESCE(AVG(views), 0)
            FROM catalog_books
            WHERE deleted_at IS NULL
              AND is_active = 1
            """.trimIndent()
        )

        val topBooks = jdbc.query(
            """
            SELECT
                b.title AS title,
                b.views AS views,
                COALESCE(CAST(b.category_id AS CHAR), '') AS categoryId,
                COALESCE(c.name, 'Sem categoria') AS categoryName
            FROM catalog_books b
            LEFT JOIN catalog_categories c ON c.id = b.category_id AND c.deleted_at IS NULL
            WHERE b.deleted_at IS NULL
              AND b.is_active = 1
            ORDER BY b.views DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            DashboardTopBookDto(
                title = rs.getString("title") ?: "",
                views = rs.getLong("views"),
                categoryId = rs.getString("categoryId") ?: "",
                categoryName = rs.getString("categoryName") ?: "Sem categoria",
            )
        }

        val topCommenters = jdbc.query(
            """
            SELECT
                c.user_id AS userId,
                COALESCE(MAX(NULLIF(TRIM(c.user_name), '')), MAX(NULLIF(TRIM(u.display_name), ''))) AS displayName,
                COUNT(*) AS cnt
            FROM engagement_comments c
            LEFT JOIN app_users u ON u.id = c.user_id AND u.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
              AND c.is_active = 1
              AND c.user_id IS NOT NULL
            GROUP BY c.user_id
            ORDER BY cnt DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            val userId = rs.getLong("userId")
            val displayName = rs.getString("displayName")
            val name =
                if (!displayName.isNullOrBlank()) {
                    displayName
                } else {
                    "Usuario #$userId"
                }
            DashboardTopCommenterDto(
                name = name,
                commentCount = rs.getLong("cnt"),
            )
        }

        val booksByCategory = jdbc.query(
            """
            SELECT
                COALESCE(CAST(b.category_id AS CHAR), '') AS categoryId,
                COALESCE(c.name, 'Sem categoria') AS categoryName,
                COUNT(*) AS bookCount
            FROM catalog_books b
            LEFT JOIN catalog_categories c ON c.id = b.category_id AND c.deleted_at IS NULL
            WHERE b.deleted_at IS NULL
              AND b.is_active = 1
            GROUP BY b.category_id, c.name
            ORDER BY bookCount DESC
            LIMIT 12
            """.trimIndent(),
        ) { rs, _ ->
            DashboardCategoryCountDto(
                categoryId = rs.getString("categoryId") ?: "",
                categoryName = rs.getString("categoryName") ?: "Sem categoria",
                bookCount = rs.getLong("bookCount"),
            )
        }

        val commentsByDay = jdbc.query(
            """
            SELECT DATE(FROM_UNIXTIME(commented_at_epoch)) AS day, COUNT(*) AS cnt
            FROM engagement_comments
            WHERE deleted_at IS NULL
              AND is_active = 1
              AND commented_at_epoch IS NOT NULL
              AND FROM_UNIXTIME(commented_at_epoch) >= DATE_SUB(CURDATE(), INTERVAL $selectedPeriodDays DAY)
            GROUP BY DATE(FROM_UNIXTIME(commented_at_epoch))
            ORDER BY day ASC
            """.trimIndent(),
        ) { rs, _ ->
            val dayStr = rs.getDate("day")?.toLocalDate()?.toString()
                ?: rs.getString("day")
                ?: ""
            DashboardDayCountDto(
                day = dayStr,
                commentCount = rs.getLong("cnt"),
            )
        }

        val recentActivities = jdbc.query(
            """
            SELECT
                activity.module,
                activity.action,
                activity.actor AS user,
                DATE_FORMAT(activity.event_at, '%d/%m %H:%i') AS activityTime
            FROM (
                SELECT
                    'Comentarios' AS module,
                    CONCAT('Comentario no livro #', c.book_id) AS action,
                    COALESCE(NULLIF(TRIM(c.user_name), ''), NULLIF(TRIM(u.display_name), ''), CONCAT('Usuario #', c.user_id)) AS actor,
                    FROM_UNIXTIME(c.commented_at_epoch) AS event_at
                FROM engagement_comments c
                LEFT JOIN app_users u ON u.id = c.user_id AND u.deleted_at IS NULL
                WHERE c.deleted_at IS NULL
                  AND c.is_active = 1
                  AND c.commented_at_epoch IS NOT NULL

                UNION ALL

                SELECT
                    'Acesso' AS module,
                    'Login no aplicativo' AS action,
                    COALESCE(NULLIF(TRIM(u.display_name), ''), CONCAT('Usuario #', l.user_id)) AS actor,
                    l.created_at AS event_at
                FROM app_user_activity_logs l
                LEFT JOIN app_users u ON u.id = l.user_id AND u.deleted_at IS NULL
                WHERE l.deleted_at IS NULL
            ) activity
            WHERE activity.event_at IS NOT NULL
            ORDER BY activity.event_at DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            DashboardRecentActivityDto(
                module = rs.getString("module") ?: "",
                action = rs.getString("action") ?: "",
                user = rs.getString("user") ?: "",
                time = rs.getString("activityTime") ?: "",
            )
        }

        return DashboardSummaryResponse(
            totals = DashboardTotalsDto(
                activeBooks = activeBooks,
                inactiveBooks = inactiveBooks,
                featuredBooks = featuredBooks,
                booksWithoutCategory = booksWithoutCategory,
                activeUsers = activeUsers,
                activeUsersLast30Days = activeUsersLast30Days,
                publishedComments = publishedComments,
                commentsLast7Days = commentsLast7Days,
                commentsPrevious7Days = commentsPrevious7Days,
                totalBookViews = totalBookViews,
                averageViewsPerActiveBook = averageViewsPerActiveBook,
            ),
            topBooks = topBooks,
            topCommenters = topCommenters,
            booksByCategory = booksByCategory,
            commentsByDay = commentsByDay,
            recentActivities = recentActivities,
        )
    }

    private fun executeLegacy(periodDays: Int?): DashboardSummaryResponse {
        val selectedPeriodDays = normalizePeriodDays(periodDays)

        val activeBooks = count("SELECT COUNT(*) FROM tbl_books WHERE status = '1'")
        val inactiveBooks = count("SELECT COUNT(*) FROM tbl_books WHERE status = '0'")
        val featuredBooks = count("SELECT COUNT(*) FROM tbl_books WHERE status = '1' AND featured = 1")
        val booksWithoutCategory = count(
            """
            SELECT COUNT(*) FROM tbl_books
            WHERE status = '1'
              AND (cat_id IS NULL OR TRIM(cat_id) = '' OR cat_id = '0')
            """.trimIndent()
        )
        val activeUsers = count("SELECT COUNT(*) FROM tbl_users WHERE is_deleted = 0 AND status = '1'")
        val activeUsersLast30Days = count(
            """
            SELECT COUNT(*)
            FROM tbl_users
            WHERE is_deleted = 0
              AND status = '1'
              AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val publishedComments = count("SELECT COUNT(*) FROM tbl_comments WHERE status = '1'")
        val commentsLast7Days = count(
            """
            SELECT COUNT(*)
            FROM tbl_comments
            WHERE status = '1'
              AND dt_rate >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val commentsPrevious7Days = count(
            """
            SELECT COUNT(*)
            FROM tbl_comments
            WHERE status = '1'
              AND dt_rate >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${selectedPeriodDays * 2} DAY)
              AND dt_rate < DATE_SUB(UTC_TIMESTAMP(), INTERVAL $selectedPeriodDays DAY)
            """.trimIndent()
        )
        val totalBookViews = count("SELECT COALESCE(SUM(book_views), 0) FROM tbl_books WHERE status = '1'")
        val averageViewsPerActiveBook = countDecimal(
            "SELECT COALESCE(AVG(book_views), 0) FROM tbl_books WHERE status = '1'"
        )

        val topBooks = jdbc.query(
            """
            SELECT
                b.book_title AS title,
                b.book_views AS views,
                COALESCE(CAST(b.cat_id AS CHAR), '') AS categoryId,
                COALESCE(c.category_name, 'Sem categoria') AS categoryName
            FROM tbl_books b
            LEFT JOIN tbl_category c ON c.cid = CAST(NULLIF(TRIM(b.cat_id), '') AS UNSIGNED)
            WHERE b.status = '1'
            ORDER BY b.book_views DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            DashboardTopBookDto(
                title = rs.getString("title") ?: "",
                views = rs.getLong("views"),
                categoryId = rs.getString("categoryId") ?: "",
                categoryName = rs.getString("categoryName") ?: "Sem categoria",
            )
        }

        val topCommenters = jdbc.query(
            """
            SELECT
                c.user_id AS userId,
                MAX(NULLIF(TRIM(c.user_name), '')) AS displayName,
                COUNT(*) AS cnt
            FROM tbl_comments c
            WHERE c.status = '1'
              AND c.user_id IS NOT NULL
            GROUP BY c.user_id
            ORDER BY cnt DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            val userId = rs.getLong("userId")
            val displayName = rs.getString("displayName")
            val name = if (!displayName.isNullOrBlank()) displayName else "Usuario #$userId"
            DashboardTopCommenterDto(
                name = name,
                commentCount = rs.getLong("cnt"),
            )
        }

        val booksByCategory = jdbc.query(
            """
            SELECT
                COALESCE(CAST(b.cat_id AS CHAR), '') AS categoryId,
                COALESCE(c.category_name, 'Sem categoria') AS categoryName,
                COUNT(*) AS bookCount
            FROM tbl_books b
            LEFT JOIN tbl_category c ON c.cid = CAST(NULLIF(TRIM(b.cat_id), '') AS UNSIGNED)
            WHERE b.status = '1'
            GROUP BY b.cat_id, c.category_name
            ORDER BY bookCount DESC
            LIMIT 12
            """.trimIndent(),
        ) { rs, _ ->
            DashboardCategoryCountDto(
                categoryId = rs.getString("categoryId") ?: "",
                categoryName = rs.getString("categoryName") ?: "Sem categoria",
                bookCount = rs.getLong("bookCount"),
            )
        }

        val commentsByDay = jdbc.query(
            """
            SELECT DATE(dt_rate) AS day, COUNT(*) AS cnt
            FROM tbl_comments
            WHERE status = '1'
              AND dt_rate >= DATE_SUB(CURDATE(), INTERVAL $selectedPeriodDays DAY)
            GROUP BY DATE(dt_rate)
            ORDER BY day ASC
            """.trimIndent(),
        ) { rs, _ ->
            val dayStr = rs.getDate("day")?.toLocalDate()?.toString()
                ?: rs.getString("day")
                ?: ""
            DashboardDayCountDto(
                day = dayStr,
                commentCount = rs.getLong("cnt"),
            )
        }

        val recentActivities = jdbc.query(
            """
            SELECT
                'Comentarios' AS module,
                CONCAT('Comentario no livro #', c.book_id) AS action,
                COALESCE(NULLIF(TRIM(c.user_name), ''), CONCAT('Usuario #', c.user_id)) AS activityUser,
                DATE_FORMAT(c.dt_rate, '%d/%m %H:%i') AS activityTime
            FROM tbl_comments c
            WHERE c.status = '1'
              AND c.dt_rate IS NOT NULL
            ORDER BY c.dt_rate DESC
            LIMIT 8
            """.trimIndent(),
        ) { rs, _ ->
            DashboardRecentActivityDto(
                module = rs.getString("module") ?: "",
                action = rs.getString("action") ?: "",
                user = rs.getString("activityUser") ?: "",
                time = rs.getString("activityTime") ?: "",
            )
        }

        return DashboardSummaryResponse(
            totals = DashboardTotalsDto(
                activeBooks = activeBooks,
                inactiveBooks = inactiveBooks,
                featuredBooks = featuredBooks,
                booksWithoutCategory = booksWithoutCategory,
                activeUsers = activeUsers,
                activeUsersLast30Days = activeUsersLast30Days,
                publishedComments = publishedComments,
                commentsLast7Days = commentsLast7Days,
                commentsPrevious7Days = commentsPrevious7Days,
                totalBookViews = totalBookViews,
                averageViewsPerActiveBook = averageViewsPerActiveBook,
            ),
            topBooks = topBooks,
            topCommenters = topCommenters,
            booksByCategory = booksByCategory,
            commentsByDay = commentsByDay,
            recentActivities = recentActivities,
        )
    }

    private fun count(sql: String): Long =
        jdbc.queryForObject(sql, Long::class.java) ?: 0L

    private fun countDecimal(sql: String): Double =
        jdbc.queryForObject(sql, Double::class.java) ?: 0.0

    private fun normalizePeriodDays(periodDays: Int?): Int {
        val allowed = setOf(7, 30, 90)
        return if (periodDays != null && periodDays in allowed) {
            periodDays
        } else {
            30
        }
    }
}
