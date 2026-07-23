package com.libare.adm.modules.rbac.application

import com.libare.adm.modules.rbac.infrastructure.persistence.repository.RoleJpaRepository
import com.libare.adm.shared.security.AuthorizationService
import com.libare.adm.shared.tenant.TenantSqlGuard
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SyncRolePermissionsUseCase(
    private val jdbcTemplate: JdbcTemplate,
    private val authorizationService: AuthorizationService
) {
    companion object {
        val SCHOOL_EXCLUDED_PERMISSIONS = setOf(
            "schools.view",
            "schools.create",
            "schools.update",
            "schools.delete",
            "platform.impersonate",
            "sites.view",
            "sites.create",
            "sites.update",
            "sites.delete",
            "sites.comments.view",
            "sites.comments.moderate"
        )
    }

    @Transactional
    fun execute(roleId: Long, permissionCodes: List<String>, roleSchoolId: Long?) {
        val distinctCodes = permissionCodes.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
        if (distinctCodes.isEmpty()) {
            throw com.libare.adm.shared.exception.BadRequestException("Selecione ao menos uma permissao")
        }

        authorizationService.assertSameSchool(roleSchoolId)

        val placeholders = distinctCodes.joinToString(",") { "?" }
        val foundCodes = jdbcTemplate.queryForList(
            """
            SELECT code FROM app_permissions
            WHERE code IN ($placeholders)
            """.trimIndent(),
            String::class.java,
            *distinctCodes.toTypedArray()
        ).toSet()

        if (foundCodes.size != distinctCodes.size) {
            throw com.libare.adm.shared.exception.BadRequestException("Permissao invalida informada")
        }

        val blocked = distinctCodes.filter { it in SCHOOL_EXCLUDED_PERMISSIONS }
        if (blocked.isNotEmpty()) {
            throw com.libare.adm.shared.exception.BadRequestException(
                "Permissoes nao permitidas para perfis de escola: ${blocked.first()}"
            )
        }

        jdbcTemplate.update("DELETE FROM app_role_permissions WHERE role_id = ?", roleId)
        jdbcTemplate.batchUpdate(
            """
            INSERT INTO app_role_permissions (role_id, permission_id)
            SELECT ?, id FROM app_permissions WHERE code = ?
            """.trimIndent(),
            distinctCodes.map { code -> arrayOf(roleId, code) }
        )
    }
}

@Service
class RolePermissionQueryService(
    private val jdbcTemplate: JdbcTemplate
) {
    fun findPermissionCodesByRoleIds(roleIds: Collection<Long>): Map<Long, List<String>> {
        if (roleIds.isEmpty()) {
            return emptyMap()
        }
        val placeholders = roleIds.joinToString(",") { "?" }
        val rows = jdbcTemplate.queryForList(
            """
            SELECT rp.role_id AS roleId, p.code AS code
            FROM app_role_permissions rp
            INNER JOIN app_permissions p ON p.id = rp.permission_id
            WHERE rp.role_id IN ($placeholders)
            ORDER BY p.code ASC
            """.trimIndent(),
            *roleIds.toTypedArray()
        )
        return rows.groupBy({ (it["roleId"] as Number).toLong() }) { row -> row["code"] as String }
    }
}

@Service
class RoleScopeService(
    private val roleRepository: RoleJpaRepository
) {
    fun listRolesForTenant(): List<com.libare.adm.modules.rbac.infrastructure.persistence.entity.RoleEntity> {
        val tenantSchoolId = TenantSqlGuard.tenantSchoolIdParam()
        return if (tenantSchoolId != null) {
            roleRepository.findBySchoolIdOrderByNameAsc(tenantSchoolId)
        } else {
            roleRepository.findBySchoolIdIsNotNullOrderByNameAsc()
        }
    }
}
