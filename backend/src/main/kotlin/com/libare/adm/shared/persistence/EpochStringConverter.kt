package com.libare.adm.shared.persistence

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

/**
 * Mapeia commented_at_epoch (BIGINT no core) para a propriedade textual commentOn,
 * preservando o formato de resposta da API (string com o epoch).
 */
@Converter
class EpochStringConverter : AttributeConverter<String, Long> {
    override fun convertToDatabaseColumn(attribute: String?): Long? =
        attribute?.trim()?.takeIf { it.isNotEmpty() }?.toLongOrNull()

    override fun convertToEntityAttribute(dbData: Long?): String? = dbData?.toString()
}
