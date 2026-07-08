package com.libare.adm.modules.users.api.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class CreateUserRequest(
    @field:NotBlank @field:Size(max = 150)
    val name: String,

    @field:NotBlank @field:Email @field:Size(max = 190)
    val email: String,

    @field:NotBlank @field:Size(min = 6, max = 100)
    val password: String,

    @field:NotBlank @field:Size(max = 40)
    val phone: String,

    @field:Size(max = 255)
    val userImage: String? = null,

    @field:Positive
    val acervoId: Long,

    @field:Size(max = 1)
    val status: String = "1"
)
