package com.libare.adm.modules.site.api

import com.libare.adm.modules.site.api.dto.SiteCommentResponse
import com.libare.adm.modules.site.application.DeleteSiteCommentUseCase
import com.libare.adm.modules.site.application.ListSiteCommentsUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/site-comments")
class SiteCommentController(
    private val listSiteCommentsUseCase: ListSiteCommentsUseCase,
    private val deleteSiteCommentUseCase: DeleteSiteCommentUseCase
) {
    @GetMapping
    fun list(): ResponseEntity<List<SiteCommentResponse>> =
        ResponseEntity.ok(listSiteCommentsUseCase.execute())

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        deleteSiteCommentUseCase.execute(id)
        return ResponseEntity.noContent().build()
    }
}
