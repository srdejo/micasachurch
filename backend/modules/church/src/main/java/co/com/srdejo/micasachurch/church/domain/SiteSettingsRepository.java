package co.com.srdejo.micasachurch.church.domain;

public interface SiteSettingsRepository {

    SiteSettings get();

    SiteSettings save(SiteSettings siteSettings);
}
