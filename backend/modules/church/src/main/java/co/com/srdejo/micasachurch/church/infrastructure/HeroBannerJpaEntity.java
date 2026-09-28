package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "hero_banners")
public class HeroBannerJpaEntity {

    @Id
    private UUID id;

    private String kicker;

    @Column(nullable = false)
    private String title;

    private String text;

    @Column(name = "cta_label")
    private String ctaLabel;

    @Column(name = "cta_href")
    private String ctaHref;

    @Column(name = "image_key")
    private String imageKey;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected HeroBannerJpaEntity() {
    }

    public HeroBannerJpaEntity(UUID id, String kicker, String title, String text, String ctaLabel, String ctaHref,
                               String imageKey, boolean active, int displayOrder) {
        this.id = id;
        this.kicker = kicker;
        this.title = title;
        this.text = text;
        this.ctaLabel = ctaLabel;
        this.ctaHref = ctaHref;
        this.imageKey = imageKey;
        this.active = active;
        this.displayOrder = displayOrder;
    }

    public UUID getId() {
        return id;
    }

    public String getKicker() {
        return kicker;
    }

    public String getTitle() {
        return title;
    }

    public String getText() {
        return text;
    }

    public String getCtaLabel() {
        return ctaLabel;
    }

    public String getCtaHref() {
        return ctaHref;
    }

    public String getImageKey() {
        return imageKey;
    }

    public boolean isActive() {
        return active;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
