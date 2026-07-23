package com.libare.adm.modules.site.reader

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

/**
 * Dispatcher por [method_name] espelhando [api_sites.php].
 */
@Component
class ApiSitesDispatcher(
    private val queries: SiteReaderQueries
) {
    fun dispatch(methodName: String, request: HttpServletRequest): Map<String, Any> {
        return when (methodName) {
            "home" -> GalileuEnvelope.wrap(queries.home())
            "cat_list" -> GalileuEnvelope.wrap(queries.catList())
            "cat_id" -> {
                val settings = queries.loadApiSettings()
                GalileuEnvelope.wrap(
                    queries.catId(param(request, "cat_id", "0"), settings.catPostOrderBy)
                )
            }
            "author_list" -> GalileuEnvelope.wrap(queries.authorList())
            "author_id" -> {
                val settings = queries.loadApiSettings()
                GalileuEnvelope.wrap(
                    queries.authorId(param(request, "author_id", "0"), settings.authorPostOrderBy)
                )
            }
            "latest" -> {
                val settings = queries.loadApiSettings()
                GalileuEnvelope.wrap(queries.latest(settings.latestLimit))
            }
            "allbook" -> GalileuEnvelope.wrap(queries.allbook())
            "search_text" -> GalileuEnvelope.wrap(
                queries.searchText(param(request, "search_text", ""))
            )
            "book_id" -> GalileuEnvelope.wrap(
                queries.bookId(param(request, "book_id", "0"))
            )
            "home_section" -> GalileuEnvelope.wrap(queries.homeSection())
            "home_section_id" -> {
                val settings = queries.loadApiSettings()
                val page = param(request, "page", "1").toIntOrNull() ?: 1
                GalileuEnvelope.wrap(
                    queries.homeSectionId(
                        param(request, "homesection_id", "0"),
                        page,
                        settings.catPostOrderBy
                    )
                )
            }
            "get_all_comments" -> GalileuEnvelope.wrap(
                queries.getAllComments(param(request, "books_id", "0"))
            )
            "removecomment" -> {
                val ok = queries.removeComment(param(request, "comment_id", "0"))
                GalileuEnvelope.wrap(
                    listOf(
                        mapOf(
                            "msg" to if (ok) "Comentário excluído com sucesso!" else "Comentário não excluído!",
                            "success" to if (ok) "1" else "0"
                        )
                    )
                )
            }
            "rating_check" -> {
                val rated = queries.ratingCheck(
                    param(request, "user_id", "0"),
                    param(request, "book_id", "0")
                )
                // PHP usa MSG / sucess (typos) neste method.
                GalileuEnvelope.wrap(
                    listOf(
                        mapOf(
                            "MSG" to if (rated) "Você já avaliou" else "Você ainda não avaliou",
                            "sucess" to if (rated) "1" else "0"
                        )
                    )
                )
            }
            "continue_reading" -> {
                val userId = request.getParameter("con_user_id")
                val bookId = request.getParameter("con_book_id")
                if (userId == null || bookId == null) {
                    GalileuEnvelope.wrap(
                        listOf(
                            mapOf(
                                "msg" to "con_user_id ou con_book_id está faltando.... !",
                                "success" to "0"
                            )
                        )
                    )
                } else {
                    val ok = queries.continueReading(userId, bookId)
                    GalileuEnvelope.wrap(
                        listOf(
                            mapOf(
                                "msg" to if (ok) {
                                    "Leitura contínua salva com sucesso!"
                                } else {
                                    "Leitura contínua não salva!"
                                },
                                "success" to if (ok) "1" else "0"
                            )
                        )
                    )
                }
            }
            "con_reding_book" -> {
                val rows = queries.continueReadingBook(param(request, "con_read_user_id", "0"))
                // PHP sem registros nao emite JSON util; devolvemos array vazio estavel.
                GalileuEnvelope.wrap(rows)
            }
            "removeuser" -> {
                val ok = queries.removeUser(param(request, "user_id", "0"))
                GalileuEnvelope.wrap(
                    listOf(
                        mapOf(
                            "msg" to if (ok) "Usuário excluído com sucesso!" else "Usuário não excluído!",
                            "success" to if (ok) "1" else "0"
                        )
                    )
                )
            }
            "delete_userdata" -> {
                when (queries.deleteUserData(param(request, "user_id", "0"))) {
                    SiteReaderQueries.DeleteUserResult.OK -> GalileuEnvelope.wrap(
                        listOf(
                            mapOf(
                                "MSG" to "Este usuário foi excluído. Entre em contato com o administrador.",
                                "success" to "1"
                            )
                        )
                    )
                    SiteReaderQueries.DeleteUserResult.NOT_FOUND -> GalileuEnvelope.wrap(
                        listOf(
                            mapOf(
                                "MSG" to "Usuário não encontrado",
                                "success" to "0"
                            )
                        )
                    )
                }
            }
            "app_details" -> GalileuEnvelope.wrap(queries.appDetails())
            else -> GalileuEnvelope.wrap(
                listOf(
                    mapOf(
                        "msg" to "Acesso negado ou dados não encontrados",
                        "success" to "1"
                    )
                )
            )
        }
    }

    private fun param(request: HttpServletRequest, name: String, default: String): String =
        request.getParameter(name)?.trim() ?: default
}
