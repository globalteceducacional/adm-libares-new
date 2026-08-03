package com.libare.adm.modules.reader.api

import org.springframework.stereotype.Component

/**
 * Dispatcher de /api.php — roteia method_name.
 * Métodos de catálogo/social entram nas Tasks 5–7; até lá devolvem fallback legado.
 */
@Component
class ApiPhpDispatcher {
    fun dispatch(method: String, params: Map<String, String>): Map<String, Any> {
        val normalized = method.trim()
        if (normalized.isBlank() || normalized !in KNOWN) {
            return legacyFallback()
        }
        return when (normalized) {
            // Task 5–7: implementar handlers reais
            else -> legacyFallback()
        }
    }

    companion object {
        val KNOWN: Set<String> = setOf(
            "home", "latest", "allbook", "search_text",
            "cat_list", "cat_id", "author_list", "author_id", "book_id",
            "home_section", "home_section_id",
            "add_comment", "get_all_comments", "removecomment",
            "submit_rating", "rating_check",
            "toggle_favourite", "favourite_list",
            "toggle_wishlist", "wishlist_list",
            "book_page_state_list", "book_page_state_save",
            "continue_reading", "con_reding_book",
            "removeuser", "delete_userdata", "app_details"
        )

        fun legacyFallback(): Map<String, Any> =
            EbookAppEnvelope.arrayOne(
                mapOf(
                    "msg" to "Acesso negado ou dados nao encontrados",
                    "success" to "1"
                )
            )
    }
}
