package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class SiteSettings {

    private final UUID id;
    private boolean liveBannerVisible;
    private String activeTheme;

    public SiteSettings(UUID id, boolean liveBannerVisible, String activeTheme) {
        this.id = id;
        this.liveBannerVisible = liveBannerVisible;
        this.activeTheme = activeTheme;
    }

    public void changeLiveBannerVisible(boolean liveBannerVisible) {
        this.liveBannerVisible = liveBannerVisible;
    }

    public void changeActiveTheme(String activeTheme) {
        this.activeTheme = activeTheme;
    }

    public UUID getId() {
        return id;
    }

    public boolean isLiveBannerVisible() {
        return liveBannerVisible;
    }

    public String getActiveTheme() {
        return activeTheme;
    }
}
