package com.libare.adm.shared.api

data class PageResponse<T>(
    val items: List<T>,
    val total: Long,
    val page: Int,
    val size: Int
) {
    companion object {
        fun <T> of(all: List<T>, page: Int?, size: Int?): PageResponse<T> {
            val total = all.size
            val effectivePage = (page ?: 1).coerceAtLeast(1)
            val effectiveSize = (size ?: total.coerceAtLeast(1)).coerceIn(1, 500)
            val from = ((effectivePage - 1) * effectiveSize).coerceAtMost(total)
            val items = if (from >= total) emptyList() else all.subList(from, minOf(from + effectiveSize, total))
            return PageResponse(items = items, total = total.toLong(), page = effectivePage, size = effectiveSize)
        }
    }
}
