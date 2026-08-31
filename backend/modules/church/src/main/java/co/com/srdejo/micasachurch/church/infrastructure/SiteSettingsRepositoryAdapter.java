package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.springframework.stereotype.Repository;

@Repository
public class SiteSettingsRepositoryAdapter implements SiteSettingsRepository {

    private final SiteSettingsSpringDataRepository springDataRepository;

    public SiteSettingsRepositoryAdapter(SiteSettingsSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public SiteSettings get() {
        SiteSettingsJpaEntity entity = springDataRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new NotFoundException("site_settings.not_found"));
        return toDomain(entity);
    }

    @Override
    public SiteSettings save(SiteSettings siteSettings) {
        SiteSettingsJpaEntity entity = new SiteSettingsJpaEntity(siteSettings.getId(), siteSettings.isLiveBannerVisible());
        return toDomain(springDataRepository.save(entity));
    }

    private SiteSettings toDomain(SiteSettingsJpaEntity entity) {
        return new SiteSettings(entity.getId(), entity.isLiveBannerVisible());
    }
}
