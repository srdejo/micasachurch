package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;

public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public SiteSettings get() {
        return siteSettingsRepository.get();
    }

    public SiteSettings update(boolean liveBannerVisible) {
        SiteSettings siteSettings = siteSettingsRepository.get();
        siteSettings.update(liveBannerVisible);
        return siteSettingsRepository.save(siteSettings);
    }
}
