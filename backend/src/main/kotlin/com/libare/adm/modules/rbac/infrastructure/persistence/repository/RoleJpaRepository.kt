package com.libare.adm.modules.rbac.infrastructure.persistence.repository

import com.libare.adm.modules.rbac.infrastructure.persistence.entity.RoleEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RoleJpaRepository : JpaRepository<RoleEntity, Long> {
    fun findBySchoolIdAndName(schoolId: Long, name: String): RoleEntity?

    fun findBySchoolIdIsNullAndName(name: String): RoleEntity?

    fun findBySchoolIdOrderByNameAsc(schoolId: Long): List<RoleEntity>

    fun findBySchoolIdIsNotNullOrderByNameAsc(): List<RoleEntity>

    fun existsBySchoolIdAndNameIgnoreCase(schoolId: Long, name: String): Boolean

    fun existsBySchoolIdAndNameIgnoreCaseAndIdNot(schoolId: Long, name: String, id: Long): Boolean
}
