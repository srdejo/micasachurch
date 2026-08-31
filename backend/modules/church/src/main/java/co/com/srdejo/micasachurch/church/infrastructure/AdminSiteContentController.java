package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.SiteContentService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/site-content")
public class AdminSiteContentController {

    private final SiteContentService siteContentService;

    public AdminSiteContentController(SiteContentService siteContentService) {
        this.siteContentService = siteContentService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.SiteContentResponse> list() {
        return siteContentService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.SiteContentResponse update(@PathVariable UUID id, @RequestBody SiteContentRequest request) {
        return PublicController.toResponse(siteContentService.update(id, request.value()));
    }

    public record SiteContentRequest(String value) {
    }
}
