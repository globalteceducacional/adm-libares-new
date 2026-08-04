package com.libare.adm.modules.reader.api

import com.libare.adm.modules.reader.application.ReaderAppDetailsUseCase
import com.libare.adm.modules.reader.application.ReaderBookDetailUseCase
import com.libare.adm.modules.reader.application.ReaderCatalogListUseCases
import com.libare.adm.modules.reader.application.ReaderHomeSectionUseCases
import com.libare.adm.modules.reader.application.ReaderHomeUseCase
import com.libare.adm.modules.reader.application.ReaderReadingUseCases
import com.libare.adm.modules.reader.application.ReaderSocialUseCases
import org.springframework.stereotype.Component

/** Dispatcher de /api.php — roteia method_name. */
@Component
class ApiPhpDispatcher(
    private val home: ReaderHomeUseCase,
    private val catalog: ReaderCatalogListUseCases,
    private val bookDetail: ReaderBookDetailUseCase,
    private val sections: ReaderHomeSectionUseCases,
    private val social: ReaderSocialUseCases,
    private val reading: ReaderReadingUseCases,
    private val appDetails: ReaderAppDetailsUseCase
) {
    fun dispatch(method: String, params: Map<String, String>): Map<String, Any> {
        val normalized = method.trim()
        if (normalized.isBlank() || normalized !in KNOWN) {
            return legacyFallback()
        }
        return when (normalized) {
            "home" -> home.home(params)
            "cat_list" -> catalog.catList(params)
            "cat_id" -> catalog.catId(params)
            "author_list" -> catalog.authorList(params)
            "author_id" -> catalog.authorId(params)
            "latest" -> catalog.latest(params)
            "allbook" -> catalog.allBook(params)
            "search_text" -> catalog.searchText(params)
            "book_id" -> bookDetail.bookId(params)
            "home_section" -> sections.homeSection(params)
            "home_section_id" -> sections.homeSectionId(params)
            "removecomment" -> social.removeComment(params)
            "add_comment" -> social.addComment(params)
            "get_all_comments" -> social.getAllComments(params)
            "rating_check" -> social.ratingCheck(params)
            "submit_rating" -> social.submitRating(params)
            "toggle_favourite" -> social.toggleFavourite(params)
            "favourite_list" -> social.favouriteList(params)
            "toggle_wishlist" -> social.toggleWishlist(params)
            "wishlist_list" -> social.wishlistList(params)
            "book_page_state_list" -> reading.bookPageStateList(params)
            "book_page_state_save" -> reading.bookPageStateSave(params)
            "continue_reading" -> reading.continueReading(params)
            "con_reding_book" -> reading.continueReadingBook(params)
            "removeuser" -> reading.removeUser(params)
            "delete_userdata" -> reading.deleteUserData(params)
            "app_details" -> appDetails.appDetails()
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
