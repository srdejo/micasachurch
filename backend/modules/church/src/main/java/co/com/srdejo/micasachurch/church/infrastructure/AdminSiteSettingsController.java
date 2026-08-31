package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/site-settings")
public class AdminSiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    public AdminSiteSettingsController(SiteSettingsService siteSettingsService) {
        this.siteSettingsService = siteSettingsService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PublicController.SiteSettingsResponse get() {
        return PublicController.toResponse(siteSettingsService.get());
    }

    @PatchMapping
    @Transactional
    public PublicController.SiteSettingsResponse update(@Valid @RequestBody SiteSettingsRequest request) {
        return PublicController.toResponse(siteSettingsService.update(request.liveBannerVisible()));
    }

    public record SiteSettingsRequest(boolean liveBannerVisible) {
    }
}
