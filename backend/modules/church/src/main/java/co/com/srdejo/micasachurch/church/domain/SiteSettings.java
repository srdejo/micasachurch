package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class SiteSettings {

    private final UUID id;
    private boolean liveBannerVisible;

    public SiteSettings(UUID id, boolean liveBannerVisible) {
        this.id = id;
        this.liveBannerVisible = liveBannerVisible;
    }

    public void update(boolean liveBannerVisible) {
        this.liveBannerVisible = liveBannerVisible;
    }

    public UUID getId() {
        return id;
    }

    public boolean isLiveBannerVisible() {
        return liveBannerVisible;
    }
}
