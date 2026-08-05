package com.libare.adm.modules.site.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.site.api.dto.SiteCoverUploadResponse
import com.libare.adm.modules.site.api.dto.SiteFileUploadResponse
import com.libare.adm.modules.site.api.dto.SiteResponse
import com.libare.adm.modules.site.api.dto.ToggleSiteStatusRequest
import com.libare.adm.modules.site.api.dto.UpsertSiteRequest
import com.libare.adm.modules.site.application.CreateSiteUseCase
import com.libare.adm.modules.site.application.DeleteSiteUseCase
import com.libare.adm.modules.site.application.ListSitesUseCase
import com.libare.adm.modules.site.application.ToggleSiteStatusUseCase
import com.libare.adm.modules.site.application.UpdateSiteUseCase
import com.libare.adm.shared.exception.ForbiddenException
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.AdminWriteResponses
import com.libare.adm.shared.openapi.OpenApiTags
import com.libare.adm.shared.security.AuthorizationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@Tag(
    name = OpenApiTags.SITES,
    description = "Conteudos do modulo Site (livros/publicacoes Galileu) gerenciados pelo painel."
)
@RestController
@RequestMapping("/api/v1/sites")
class SiteController(
    private val listSitesUseCase: ListSitesUseCase,
    private val createSiteUseCase: CreateSiteUseCase,
    private val updateSiteUseCase: UpdateSiteUseCase,
    private val toggleSiteStatusUseCase: ToggleSiteStatusUseCase,
    private val deleteSiteUseCase: DeleteSiteUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage,
    private val authorizationService: AuthorizationService
) {
    @Operation(
        summary = "Listar conteudos do site",
        description = "Lista todos os conteudos (livros/publicacoes) cadastrados no modulo Site."
    )
    @AdminSecured
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Lista de conteudos",
            content = [Content(schema = Schema(implementation = SiteResponse::class))]
        )
    )
    @GetMapping
    fun list(): ResponseEntity<List<SiteResponse>> =
        ResponseEntity.ok(listSitesUseCase.execute())

    @Operation(
        summary = "Criar conteudo do site",
        description = "Cadastra um novo conteudo com categorias, autor, titulo e arquivo."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Conteudo criado",
            content = [Content(schema = Schema(implementation = SiteResponse::class))]
        )
    )
    @PostMapping
    fun create(@Valid @RequestBody request: UpsertSiteRequest): ResponseEntity<SiteResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(createSiteUseCase.execute(request))

    @Operation(
        summary = "Atualizar conteudo do site",
        description = "Altera dados de um conteudo existente (categorias, autor, titulo, arquivo, status)."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Conteudo atualizado",
            content = [Content(schema = Schema(implementation = SiteResponse::class))]
        )
    )
    @PutMapping("/{siteId}")
    fun update(
        @Parameter(description = "ID do conteudo (site)")
        @PathVariable siteId: Long,
        @Valid @RequestBody request: UpsertSiteRequest
    ): ResponseEntity<SiteResponse> =
        ResponseEntity.ok(updateSiteUseCase.execute(siteId, request))

    @Operation(
        summary = "Alternar status do conteudo Site",
        description = "Ativa ou desativa um conteudo (status 0 ou 1). Requer permissao sites.toggle_status (ex.: role PROFESSOR)."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Status atualizado",
            content = [Content(schema = Schema(implementation = SiteResponse::class))]
        )
    )
    @PatchMapping("/{siteId}/status")
    fun toggleStatus(
        @Parameter(description = "ID do conteudo (site)", required = true)
        @PathVariable siteId: Long,
        @Valid @RequestBody request: ToggleSiteStatusRequest
    ): ResponseEntity<SiteResponse> =
        ResponseEntity.ok(toggleSiteStatusUseCase.execute(siteId, request.status))

    @Operation(
        summary = "Excluir conteudo do site",
        description = "Remove permanentemente um conteudo do modulo Site."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Conteudo excluido")
    )
    @DeleteMapping("/{siteId}")
    fun delete(
        @Parameter(description = "ID do conteudo (site)")
        @PathVariable siteId: Long
    ): ResponseEntity<Void> {
        deleteSiteUseCase.execute(siteId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Upload de capa",
        description = "Envia imagem de capa para storage legado. Requer permissao sites.create ou sites.update."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Capa armazenada",
            content = [Content(schema = Schema(implementation = SiteCoverUploadResponse::class))]
        )
    )
    @PostMapping("/upload/cover")
    fun uploadCover(
        @Parameter(description = "Arquivo de imagem da capa")
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<SiteCoverUploadResponse> {
        requireUploadPermission()
        val filename = legacyBookAssetStorage.storeCover(file)
        return ResponseEntity.ok(SiteCoverUploadResponse(filename = filename))
    }

    @Operation(
        summary = "Upload de arquivo do conteudo",
        description = "Envia PDF ou arquivo do conteudo para storage legado. Requer permissao sites.create ou sites.update."
    )
    @AdminSecured
    @AdminWriteResponses
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Arquivo armazenado",
            content = [Content(schema = Schema(implementation = SiteFileUploadResponse::class))]
        )
    )
    @PostMapping("/upload/file")
    fun uploadFile(
        @Parameter(description = "Arquivo do conteudo (PDF, etc.)")
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<SiteFileUploadResponse> {
        requireUploadPermission()
        val stored = legacyBookAssetStorage.storeBookFile(file)
        return ResponseEntity.ok(
            SiteFileUploadResponse(
                filename = stored.filename,
                fileUrl = stored.fileUrl
            )
        )
    }

    private fun requireUploadPermission() {
        if (!authorizationService.can("sites.create") && !authorizationService.can("sites.update")) {
            throw ForbiddenException("Permissao negada")
        }
    }
}
