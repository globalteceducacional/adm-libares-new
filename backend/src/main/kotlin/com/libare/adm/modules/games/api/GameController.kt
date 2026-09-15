package com.libare.adm.modules.games.api

import com.libare.adm.modules.catalog.infrastructure.storage.LegacyBookAssetStorage
import com.libare.adm.modules.catalog.api.dto.BookCoverUploadResponse
import com.libare.adm.modules.games.api.dto.GameResponse
import com.libare.adm.modules.games.api.dto.UpsertGameRequest
import com.libare.adm.modules.games.application.GamesCrudUseCase
import com.libare.adm.shared.openapi.AdminSecured
import com.libare.adm.shared.openapi.OpenApiTags
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@Tag(name = OpenApiTags.GAMES, description = "Jogos educativos (tabela Jogos do dump legado)")
@AdminSecured
@RestController
@RequestMapping("/api/v1/games")
class GameController(
    private val gamesCrudUseCase: GamesCrudUseCase,
    private val legacyBookAssetStorage: LegacyBookAssetStorage
) {
    @Operation(summary = "Listar jogos")
    @GetMapping
    fun list(): ResponseEntity<List<GameResponse>> = ResponseEntity.ok(gamesCrudUseCase.list())

    @Operation(summary = "Criar jogo")
    @PostMapping
    fun create(@RequestBody request: UpsertGameRequest): ResponseEntity<GameResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(gamesCrudUseCase.create(request))

    @Operation(summary = "Atualizar jogo")
    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody request: UpsertGameRequest): ResponseEntity<GameResponse> =
        ResponseEntity.ok(gamesCrudUseCase.update(id, request))

    @Operation(summary = "Excluir jogo")
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<Void> {
        gamesCrudUseCase.delete(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "Upload de capa do jogo")
    @PostMapping("/upload/cover")
    fun uploadCover(@RequestParam("file") file: MultipartFile): ResponseEntity<BookCoverUploadResponse> {
        val filename = legacyBookAssetStorage.storeCover(file)
        return ResponseEntity.ok(BookCoverUploadResponse(filename = filename))
    }
}
