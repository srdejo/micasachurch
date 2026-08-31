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

    protected SiteSettingsJpaEntity() {
    }

    public SiteSettingsJpaEntity(UUID id, boolean liveBannerVisible) {
        this.id = id;
        this.liveBannerVisible = liveBannerVisible;
    }

    public UUID getId() {
        return id;
    }

    public boolean isLiveBannerVisible() {
        return liveBannerVisible;
    }
}
