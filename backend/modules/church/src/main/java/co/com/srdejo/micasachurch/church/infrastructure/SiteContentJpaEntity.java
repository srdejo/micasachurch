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

    @Column(nullable = false, columnDefinition = "text")
    private String value;

    protected SiteContentJpaEntity() {
    }

    public SiteContentJpaEntity(UUID id, String key, String label, String value) {
        this.id = id;
        this.key = key;
        this.label = label;
        this.value = value;
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

    public String getValue() {
        return value;
    }
}
