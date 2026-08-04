package com.libare.adm.modules.reader.application

import com.libare.adm.modules.reader.api.EbookAppEnvelope
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

/** Espelho de method_name=app_details (tbl_settings id=1). */
@Service
class ReaderAppDetailsUseCase(
    private val jdbc: JdbcTemplate
) {
    fun appDetails(): Map<String, Any> {
        val rows = try {
            jdbc.query("SELECT * FROM tbl_settings WHERE id = 1 OR id = '1'") { rs, _ ->
                linkedMapOf<String, Any?>(
                    "app_name" to rs.getString("app_name"),
                    "onesignal_rest_key" to rs.getString("onesignal_rest_key"),
                    "onesignal_app_id" to rs.getString("onesignal_app_id"),
                    "app_logo" to rs.getString("app_logo"),
                    "app_version" to rs.getString("app_version"),
                    "app_author" to rs.getString("app_author"),
                    "app_contact" to rs.getString("app_contact"),
                    "app_email" to rs.getString("app_email"),
                    "app_website" to rs.getString("app_website"),
                    "app_description" to rs.getString("app_description")?.replace("\\'", "'"),
                    "publisher_id" to rs.getString("publisher_id"),
                    // Typo legado do PHP — manter.
                    "interstital_ad_id" to rs.getString("interstital_ad_id"),
                    "interstital_ad_id_status" to rs.getObject("interstital_ad_id_status"),
                    "banner_ad_id" to rs.getString("banner_ad_id"),
                    "banner_ad_id_status" to rs.getObject("banner_ad_id_status"),
                    "interstital_ad_id_ios" to rs.getString("interstital_ad_id_ios"),
                    "interstital_ad_id_ios_status" to rs.getObject("interstital_ad_id_ios_status"),
                    "banner_ad_id_ios" to rs.getString("banner_ad_id_ios"),
                    "banner_ad_id_ios_status" to rs.getObject("banner_ad_id_ios_status"),
                    "app_open_ad_id" to rs.getString("app_open_ad_id"),
                    "app_open_ad_id_status" to rs.getObject("app_open_ad_id_status"),
                    "ios_app_open_ad_id" to rs.getString("ios_app_open_ad_id"),
                    "ios_app_open_ad_id_status" to rs.getObject("ios_app_open_ad_id_status"),
                    "app_privacy_policy" to rs.getString("app_privacy_policy")?.replace("\\'", "'")
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
        return EbookAppEnvelope.array(rows)
    }
}
