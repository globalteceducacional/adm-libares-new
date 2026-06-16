package com.libare.adm.shared.persistence

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

/**
 * Converte o status legado String "1"/"0" para o boolean is_active do schema core.
 * Mantem o contrato da API (status textual) sem alterar entidades/DTOs de fora.
 */
@Converter
class StatusBooleanConverter : AttributeConverter<String, Boolean> {
    override fun convertToDatabaseColumn(attribute: String?): Boolean = attribute?.trim() == "1"

    override fun convertToEntityAttribute(dbData: Boolean?): String = if (dbData == true) "1" else "0"
}
