package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "link_entries")
public class LinkEntryJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "text")
    private String value;

    protected LinkEntryJpaEntity() {
    }

    public LinkEntryJpaEntity(UUID id, String key, String label, String value) {
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
