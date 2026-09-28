package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import co.com.srdejo.micasachurch.church.application.ThemePaletteService;
import co.com.srdejo.micasachurch.church.domain.SiteSettings;
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
    private final ThemePaletteService themePaletteService;

    public AdminSiteSettingsController(SiteSettingsService siteSettingsService, ThemePaletteService themePaletteService) {
        this.siteSettingsService = siteSettingsService;
        this.themePaletteService = themePaletteService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PublicController.SiteSettingsResponse get() {
        return toResponse(siteSettingsService.get());
    }

    @PatchMapping
    @Transactional
    public PublicController.SiteSettingsResponse update(@Valid @RequestBody SiteSettingsRequest request) {
        return toResponse(siteSettingsService.update(request.liveBannerVisible(), request.activeTheme()));
    }

    private PublicController.SiteSettingsResponse toResponse(SiteSettings siteSettings) {
        return PublicController.toResponse(siteSettings, themePaletteService.findActive(siteSettings.getActiveTheme()));
    }

    public record SiteSettingsRequest(Boolean liveBannerVisible, String activeTheme) {
    }
}
