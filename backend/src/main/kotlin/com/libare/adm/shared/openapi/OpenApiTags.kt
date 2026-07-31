package com.libare.adm.shared.openapi

/**
 * Nomes de tags do Swagger (agrupamento na UI).
 * Usar com [io.swagger.v3.oas.annotations.tags.Tag].
 */
object OpenApiTags {
    const val AUTH = "Autenticacao"
    const val USERS = "Usuarios do app"
    const val TEAM = "Equipe do painel"
    const val SCHOOLS = "Escolas"
    const val ROLES = "Perfis e permissoes"
    const val BOOKS = "Livros"
    const val AUTHORS = "Autores"
    const val CATEGORIES = "Categorias"
    const val HOME_SECTIONS = "Secoes da home"
    const val ACERVOS = "Acervos"
    const val COMMENTS = "Comentarios"
    const val DASHBOARD = "Dashboard"
    const val AUDIT = "Auditoria"
    const val SITES = "Site - Conteudos"
    const val SITE_AUTHORS = "Site - Autores"
    const val SITE_CATEGORIES = "Site - Categorias"
    const val SITE_SECTIONS = "Site - Secoes"
    const val SITE_COMMENTS = "Site - Comentarios"
    const val READER_SITE = "Leitor publico (Site)"
}

/** Header de contexto de escola usado no multi-tenant. */
object OpenApiHeaders {
    const val SCHOOL_CONTEXT = "X-School-Context"
    const val SCHOOL_CONTEXT_DESC =
        "ID da escola ativa no painel. Obrigatorio quando o usuario tem multiplas escolas " +
            "ou quando o SUPER precisa operar em um tenant especifico."
}
