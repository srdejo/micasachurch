package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "site_settings")
public class SiteSettingsJpaEntity {

    @Id
    private UUID id;

    @Column(name = "live_banner_visible", nullable = false)
    private boolean liveBannerVisible;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", nullable = false, length = 7)
    private String secondaryColor;

    @Column(name = "tertiary_color", nullable = false, length = 7)
    private String tertiaryColor;

    protected SiteSettingsJpaEntity() {
    }

    public SiteSettingsJpaEntity(UUID id, boolean liveBannerVisible, String primaryColor, String secondaryColor,
                                 String tertiaryColor) {
        this.id = id;
        this.liveBannerVisible = liveBannerVisible;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.tertiaryColor = tertiaryColor;
    }

    public UUID getId() {
        return id;
    }

    public boolean isLiveBannerVisible() {
        return liveBannerVisible;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public String getTertiaryColor() {
        return tertiaryColor;
    }
}
