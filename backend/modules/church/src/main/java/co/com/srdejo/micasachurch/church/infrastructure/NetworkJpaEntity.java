package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "networks")
public class NetworkJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "lead_contact")
    private String leadContact;

    protected NetworkJpaEntity() {
    }

    public NetworkJpaEntity(UUID id, String key, String name, String description, String leadContact) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.description = description;
        this.leadContact = leadContact;
    }

    public UUID getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLeadContact() {
        return leadContact;
    }
}
