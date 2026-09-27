package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;

public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public SiteSettings get() {
        return siteSettingsRepository.get();
    }

    /**
     * Null fields are left as they are, so the live-banner toggle and the color editor can each
     * PATCH only what they own.
     */
    public SiteSettings update(Boolean liveBannerVisible, String primaryColor, String secondaryColor, String tertiaryColor) {
        SiteSettings siteSettings = siteSettingsRepository.get();
        if (liveBannerVisible != null) {
            siteSettings.changeLiveBannerVisible(liveBannerVisible);
        }
        String primary = primaryColor != null ? primaryColor : siteSettings.getPrimaryColor();
        String secondary = secondaryColor != null ? secondaryColor : siteSettings.getSecondaryColor();
        String tertiary = tertiaryColor != null ? tertiaryColor : siteSettings.getTertiaryColor();
        if (!SiteSettings.isValidColor(primary) || !SiteSettings.isValidColor(secondary) || !SiteSettings.isValidColor(tertiary)) {
            throw new BusinessRuleException("site_settings.invalid_color");
        }
        siteSettings.changeColors(primary, secondary, tertiary);
        return siteSettingsRepository.save(siteSettings);
    }
}
