package com.libare.adm.modules.rbac.application

import com.libare.adm.shared.exception.ForbiddenException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class TeamCreateAuthorizationTest {
    @Test
    fun `super pode SCHOOL_ADMIN e PROFESSOR`() {
        assertEquals(
            setOf("SCHOOL_ADMIN", "PROFESSOR"),
            TeamCreateAuthorization.allowedRoleCodes(true)
        )
    }

    @Test
    fun `nao-super so PROFESSOR`() {
        assertEquals(setOf("PROFESSOR"), TeamCreateAuthorization.allowedRoleCodes(false))
    }

    @Test
    fun `school admin nao cria SCHOOL_ADMIN`() {
        assertThrows(ForbiddenException::class.java) {
            TeamCreateAuthorization.assertCanCreate(false, "SCHOOL_ADMIN")
        }
    }

    @Test
    fun `school admin cria PROFESSOR`() {
        TeamCreateAuthorization.assertCanCreate(false, "professor")
    }

    @Test
    fun `school admin nao atribui escola alheia`() {
        assertThrows(ForbiddenException::class.java) {
            TeamCreateAuthorization.assertCanAssignSchool(false, 99L, setOf(1L, 2L))
        }
    }
}
