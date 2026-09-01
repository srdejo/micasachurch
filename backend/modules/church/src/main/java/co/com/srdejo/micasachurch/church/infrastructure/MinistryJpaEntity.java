package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "ministries")
public class MinistryJpaEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "draft_name")
    private String draftName;

    @Column(name = "draft_description", columnDefinition = "text")
    private String draftDescription;

    @Column(name = "draft_published")
    private Boolean draftPublished;

    @Column(name = "has_draft", nullable = false)
    private boolean hasDraft;

    protected MinistryJpaEntity() {
    }

    public MinistryJpaEntity(UUID id, String name, String description, int displayOrder, boolean published, String draftName,
                              String draftDescription, Boolean draftPublished, boolean hasDraft) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.published = published;
        this.draftName = draftName;
        this.draftDescription = draftDescription;
        this.draftPublished = draftPublished;
        this.hasDraft = hasDraft;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isPublished() {
        return published;
    }

    public String getDraftName() {
        return draftName;
    }

    public String getDraftDescription() {
        return draftDescription;
    }

    public Boolean getDraftPublished() {
        return draftPublished;
    }

    public boolean isHasDraft() {
        return hasDraft;
    }
}
