package com.libare.adm.modules.auth.application

import com.libare.adm.modules.auth.api.dto.AuthMeResponse
import com.libare.adm.modules.auth.api.dto.UpdateAuthProfileRequest
import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.rbac.infrastructure.persistence.repository.PanelAdminUserJpaRepository
import com.libare.adm.shared.exception.BadRequestException
import com.libare.adm.shared.exception.UnauthorizedException
import com.libare.adm.shared.tenant.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class UpdateAdminProfileUseCase(
    private val panelAdminUserRepository: PanelAdminUserJpaRepository,
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage
) {
    @Transactional
    fun execute(request: UpdateAuthProfileRequest): AuthMeResponse {
        val admin = loadAdmin()
        request.name?.trim()?.takeIf { it.isNotEmpty() }?.let { admin.name = it }
        request.uiTheme?.trim()?.lowercase()?.let { theme ->
            if (theme !in setOf("light", "dark")) {
                throw BadRequestException("Tema invalido")
            }
            admin.uiTheme = theme
        }
        panelAdminUserRepository.save(admin)
        return getCurrentUserUseCase.execute()
    }

    @Transactional
    fun uploadAvatar(file: MultipartFile): AuthMeResponse {
        val admin = loadAdmin()
        admin.imageFilename = legacyBookAssetStorage.storeCatalogImage(file)
        panelAdminUserRepository.save(admin)
        return getCurrentUserUseCase.execute()
    }

    private fun loadAdmin() =
        panelAdminUserRepository.findById(TenantContext.get().userId).orElse(null)
            ?: throw UnauthorizedException("Sessao invalida ou expirada")
}
