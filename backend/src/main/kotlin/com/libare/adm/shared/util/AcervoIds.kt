package com.libare.adm.shared.util

import com.libare.adm.shared.exception.BadRequestException

fun Long.toAcervoId(): Int {
    if (this <= 0 || this > Int.MAX_VALUE) {
        throw BadRequestException("ID de acervo invalido")
    }
    return this.toInt()
}

fun List<Long>.toAcervoIds(): List<Int> = map { it.toAcervoId() }

fun Int.toAcervoIdLong(): Long = this.toLong()
