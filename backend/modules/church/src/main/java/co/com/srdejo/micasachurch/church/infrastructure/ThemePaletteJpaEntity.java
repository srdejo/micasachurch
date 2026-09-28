package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "theme_palettes")
public class ThemePaletteJpaEntity {

    @Id
    private String name;

    @Column(name = "accent_color", nullable = false, length = 7)
    private String accentColor;

    @Column(name = "deep_color", nullable = false, length = 7)
    private String deepColor;

    @Column(name = "soft_color", nullable = false, length = 7)
    private String softColor;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected ThemePaletteJpaEntity() {
    }

    public ThemePaletteJpaEntity(String name, String accentColor, String deepColor, String softColor, int displayOrder) {
        this.name = name;
        this.accentColor = accentColor;
        this.deepColor = deepColor;
        this.softColor = softColor;
        this.displayOrder = displayOrder;
    }

    public String getName() {
        return name;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public String getDeepColor() {
        return deepColor;
    }

    public String getSoftColor() {
        return softColor;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
