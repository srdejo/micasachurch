package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "site_contents")
public class SiteContentJpaEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, length = 32)
    private String section;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false, columnDefinition = "text")
    private String value;

    @Column(name = "draft_value", columnDefinition = "text")
    private String draftValue;

    @Column(name = "has_draft", nullable = false)
    private boolean hasDraft;

    protected SiteContentJpaEntity() {
    }

    public SiteContentJpaEntity(UUID id, String key, String label, String section, int displayOrder, String value,
                               String draftValue, boolean hasDraft) {
        this.id = id;
        this.key = key;
        this.label = label;
        this.section = section;
        this.displayOrder = displayOrder;
        this.value = value;
        this.draftValue = draftValue;
        this.hasDraft = hasDraft;
    }

    public UUID getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public String getSection() {
        return section;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public String getValue() {
        return value;
    }

    public String getDraftValue() {
        return draftValue;
    }

    public boolean isHasDraft() {
        return hasDraft;
    }
}
