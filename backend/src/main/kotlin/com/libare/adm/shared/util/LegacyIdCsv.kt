package com.libare.adm.shared.util

fun List<Long>.toLegacyIdCsv(): String =
    distinct().sorted().joinToString(",")

fun String?.parseLegacyIdList(): List<Long> =
    this
        ?.split(",")
        ?.mapNotNull { segment ->
            segment.trim().takeIf { it.isNotEmpty() }?.toLongOrNull()
        }
        ?: emptyList()
