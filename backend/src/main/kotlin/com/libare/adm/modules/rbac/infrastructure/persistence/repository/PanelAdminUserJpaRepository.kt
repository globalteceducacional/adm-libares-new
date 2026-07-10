package com.libare.adm.modules.rbac.infrastructure.persistence.repository

import com.libare.adm.modules.rbac.infrastructure.persistence.entity.PanelAdminUserEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.Optional

interface PanelAdminUserJpaRepository : JpaRepository<PanelAdminUserEntity, Long> {
    fun findByUsername(username: String): Optional<PanelAdminUserEntity>

    fun existsByUsernameIgnoreCase(username: String): Boolean

    @Query(
        value = """
            SELECT DISTINCT p.code
            FROM app_admin_user_roles aur
            INNER JOIN app_role_permissions rp ON rp.role_id = aur.role_id
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            INNER JOIN app_roles r ON r.id = aur.role_id
            WHERE aur.admin_user_id = :adminUserId
              AND r.status = '1'
        """,
        nativeQuery = true
    )
    fun findPermissionCodesByAdminUserId(adminUserId: Long): List<String>
}
