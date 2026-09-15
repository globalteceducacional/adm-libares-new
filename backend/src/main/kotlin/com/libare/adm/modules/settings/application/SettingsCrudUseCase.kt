package com.libare.adm.modules.settings.application

import com.libare.adm.modules.settings.api.dto.SettingsResponse
import com.libare.adm.modules.settings.api.dto.UpdateSettingsRequest
import com.libare.adm.shared.exception.NotFoundException
import com.libare.adm.shared.security.AuthorizationService
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class SettingsCrudUseCase(
    private val jdbc: JdbcTemplate,
    private val authorizationService: AuthorizationService
) {
    fun get(): SettingsResponse {
        authorizationService.check("settings.view")
        return load() ?: throw NotFoundException("Definicoes nao encontradas")
    }

    fun update(request: UpdateSettingsRequest): SettingsResponse {
        authorizationService.check("settings.update")
        load() ?: throw NotFoundException("Definicoes nao encontradas")
        jdbc.update(
            """
            UPDATE tbl_settings SET
                app_name = COALESCE(?, app_name),
                app_logo = COALESCE(?, app_logo),
                app_email = COALESCE(?, app_email),
                app_version = COALESCE(?, app_version),
                app_author = COALESCE(?, app_author),
                app_contact = COALESCE(?, app_contact),
                app_website = COALESCE(?, app_website),
                app_description = COALESCE(?, app_description),
                api_latest_limit = COALESCE(?, api_latest_limit),
                api_cat_order_by = COALESCE(?, api_cat_order_by),
                api_cat_post_order_by = COALESCE(?, api_cat_post_order_by),
                api_author_order_by = COALESCE(?, api_author_order_by),
                api_author_post_order_by = COALESCE(?, api_author_post_order_by),
                app_privacy_policy = COALESCE(?, app_privacy_policy),
                publisher_id = COALESCE(?, publisher_id),
                onesignal_app_id = COALESCE(?, onesignal_app_id),
                onesignal_rest_key = CASE WHEN ? IS NULL OR TRIM(?) = '' THEN onesignal_rest_key ELSE ? END,
                interstital_ad_id = COALESCE(?, interstital_ad_id),
                interstital_ad_id_status = COALESCE(?, interstital_ad_id_status),
                banner_ad_id = COALESCE(?, banner_ad_id),
                banner_ad_id_status = COALESCE(?, banner_ad_id_status)
            WHERE id = 1
            """.trimIndent(),
            request.appName,
            request.appLogo,
            request.appEmail,
            request.appVersion,
            request.appAuthor,
            request.appContact,
            request.appWebsite,
            request.appDescription,
            request.apiLatestLimit,
            request.apiCatOrderBy,
            request.apiCatPostOrderBy,
            request.apiAuthorOrderBy,
            request.apiAuthorPostOrderBy,
            request.appPrivacyPolicy,
            request.publisherId,
            request.onesignalAppId,
            request.onesignalRestKey,
            request.onesignalRestKey,
            request.onesignalRestKey,
            request.interstitalAdId,
            request.interstitalAdIdStatus,
            request.bannerAdId,
            request.bannerAdIdStatus
        )
        return load() ?: throw NotFoundException("Definicoes nao encontradas")
    }

    fun loadPrivacyHtml(): String {
        val html = jdbc.query(
            "SELECT app_privacy_policy FROM tbl_settings WHERE id = 1 LIMIT 1"
        ) { rs, _ -> rs.getString(1) }.firstOrNull().orEmpty()
        return html.ifBlank { "<p>Politica de privacidade nao cadastrada.</p>" }
    }

    fun loadOnesignalCredentials(): Pair<String, String> {
        val row = jdbc.query(
            "SELECT onesignal_app_id, onesignal_rest_key FROM tbl_settings WHERE id = 1 LIMIT 1"
        ) { rs, _ ->
            rs.getString("onesignal_app_id").orEmpty() to rs.getString("onesignal_rest_key").orEmpty()
        }.firstOrNull()
        return row ?: ("" to "")
    }

    private fun load(): SettingsResponse? {
        return jdbc.query(
            """
            SELECT id, app_name, app_logo, app_email, app_version, app_author, app_contact, app_website,
                   app_description, api_latest_limit, api_cat_order_by, api_cat_post_order_by,
                   api_author_order_by, api_author_post_order_by, app_privacy_policy, publisher_id,
                   onesignal_app_id, onesignal_rest_key, interstital_ad_id, interstital_ad_id_status,
                   banner_ad_id, banner_ad_id_status
            FROM tbl_settings WHERE id = 1 LIMIT 1
            """.trimIndent()
        ) { rs, _ -> mapRow(rs) }.firstOrNull()
    }

    private fun mapRow(rs: ResultSet): SettingsResponse {
        val restKey = rs.getString("onesignal_rest_key").orEmpty()
        return SettingsResponse(
            id = rs.getInt("id"),
            appName = rs.getString("app_name").orEmpty(),
            appLogo = rs.getString("app_logo").orEmpty(),
            appEmail = rs.getString("app_email").orEmpty(),
            appVersion = rs.getString("app_version").orEmpty(),
            appAuthor = rs.getString("app_author").orEmpty(),
            appContact = rs.getString("app_contact").orEmpty(),
            appWebsite = rs.getString("app_website").orEmpty(),
            appDescription = rs.getString("app_description").orEmpty(),
            apiLatestLimit = rs.getInt("api_latest_limit"),
            apiCatOrderBy = rs.getString("api_cat_order_by").orEmpty(),
            apiCatPostOrderBy = rs.getString("api_cat_post_order_by").orEmpty(),
            apiAuthorOrderBy = rs.getString("api_author_order_by").orEmpty(),
            apiAuthorPostOrderBy = rs.getString("api_author_post_order_by").orEmpty(),
            appPrivacyPolicy = rs.getString("app_privacy_policy").orEmpty(),
            publisherId = rs.getString("publisher_id").orEmpty(),
            onesignalAppId = rs.getString("onesignal_app_id").orEmpty(),
            hasOnesignalRestKey = restKey.isNotBlank(),
            interstitalAdId = rs.getString("interstital_ad_id").orEmpty(),
            interstitalAdIdStatus = rs.getInt("interstital_ad_id_status"),
            bannerAdId = rs.getString("banner_ad_id").orEmpty(),
            bannerAdIdStatus = rs.getInt("banner_ad_id_status")
        )
    }
}
