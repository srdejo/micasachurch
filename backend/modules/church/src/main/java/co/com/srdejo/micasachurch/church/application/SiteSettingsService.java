package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;
import co.com.srdejo.micasachurch.church.domain.ThemePaletteRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;
    private final ThemePaletteRepository themePaletteRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository, ThemePaletteRepository themePaletteRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
        this.themePaletteRepository = themePaletteRepository;
    }

    public SiteSettings get() {
        return siteSettingsRepository.get();
    }

    /**
     * Null fields are left as they are, so the live-banner toggle and the appearance view can each
     * PATCH only what they own.
     */
    public SiteSettings update(Boolean liveBannerVisible, String activeTheme) {
        SiteSettings siteSettings = siteSettingsRepository.get();
        if (liveBannerVisible != null) {
            siteSettings.changeLiveBannerVisible(liveBannerVisible);
        }
        if (activeTheme != null) {
            themePaletteRepository.findByName(activeTheme).orElseThrow(() -> new NotFoundException("theme.not_found"));
            siteSettings.changeActiveTheme(activeTheme);
        }
        return siteSettingsRepository.save(siteSettings);
    }
}
