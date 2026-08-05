package com.libare.adm.modules.schools.application

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProvisionSchoolRolesUseCase(
    private val jdbcTemplate: JdbcTemplate
) {
    @Transactional
    fun execute(schoolId: Long) {
        provisionSchoolAdmin(schoolId)
        provisionProfessor(schoolId)
    }

    private fun provisionSchoolAdmin(schoolId: Long) {
        val existingRoleId = jdbcTemplate.query(
            """
            SELECT id FROM app_roles
            WHERE school_id = ? AND name = 'SCHOOL_ADMIN'
            LIMIT 1
            """.trimIndent(),
            { rs, _ -> rs.getLong("id") },
            schoolId
        ).firstOrNull()

        val roleId = existingRoleId ?: run {
            jdbcTemplate.update(
                """
                INSERT INTO app_roles (school_id, name, is_system, status)
                VALUES (?, 'SCHOOL_ADMIN', 1, '1')
                """.trimIndent(),
                schoolId
            )
            jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        }

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
            SELECT ?, p.id
            FROM app_permissions p
            WHERE p.code NOT IN (
                'schools.view', 'schools.create', 'schools.update', 'schools.delete', 'platform.impersonate',
                'sites.view', 'sites.create', 'sites.update', 'sites.delete',
                'sites.comments.view', 'sites.comments.moderate'
            )
            """.trimIndent(),
            roleId
        )
    }

    private fun provisionProfessor(schoolId: Long) {
        val existingRoleId = jdbcTemplate.query(
            """
            SELECT id FROM app_roles
            WHERE school_id = ? AND name = 'PROFESSOR'
            LIMIT 1
            """.trimIndent(),
            { rs, _ -> rs.getLong("id") },
            schoolId
        ).firstOrNull()

        val roleId = existingRoleId ?: run {
            jdbcTemplate.update(
                """
                INSERT INTO app_roles (school_id, name, is_system, status)
                VALUES (?, 'PROFESSOR', 1, '1')
                """.trimIndent(),
                schoolId
            )
            jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long::class.java)!!
        }

        jdbcTemplate.update(
            """
            INSERT IGNORE INTO app_role_permissions (role_id, permission_id)
            SELECT ?, p.id
            FROM app_permissions p
            WHERE p.code IN (
                'books.view', 'books.toggle_status',
                'sites.view', 'sites.toggle_status'
            )
            """.trimIndent(),
            roleId
        )
    }
}
