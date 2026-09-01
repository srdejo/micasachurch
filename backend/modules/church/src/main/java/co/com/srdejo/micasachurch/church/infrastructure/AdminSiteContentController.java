package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.SiteContentService;
import co.com.srdejo.micasachurch.church.domain.SiteContent;
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
    public List<AdminSiteContentResponse> list() {
        return siteContentService.listAll().stream().map(AdminSiteContentController::toAdminResponse).toList();
    }

    @PatchMapping("/{id}")
    @Transactional
    public AdminSiteContentResponse update(@PathVariable UUID id, @RequestBody SiteContentRequest request) {
        return toAdminResponse(siteContentService.update(id, request.value()));
    }

    private static AdminSiteContentResponse toAdminResponse(SiteContent siteContent) {
        return new AdminSiteContentResponse(siteContent.getId(), siteContent.getKey(), siteContent.getLabel(),
                siteContent.hasDraft() ? siteContent.getDraftValue() : siteContent.getValue(), siteContent.hasDraft());
    }

    public record SiteContentRequest(String value) {
    }

    public record AdminSiteContentResponse(UUID id, String key, String label, String value, boolean hasDraft) {
    }
}
