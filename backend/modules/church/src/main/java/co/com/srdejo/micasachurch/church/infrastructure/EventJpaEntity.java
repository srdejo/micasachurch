package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "events")
public class EventJpaEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String day;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String detail;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "draft_day")
    private String draftDay;

    @Column(name = "draft_month")
    private String draftMonth;

    @Column(name = "draft_title")
    private String draftTitle;

    @Column(name = "draft_detail", columnDefinition = "text")
    private String draftDetail;

    @Column(name = "draft_published")
    private Boolean draftPublished;

    @Column(name = "has_draft", nullable = false)
    private boolean hasDraft;

    protected EventJpaEntity() {
    }

    public EventJpaEntity(UUID id, String day, String month, String title, String detail, boolean published, int displayOrder,
                           String draftDay, String draftMonth, String draftTitle, String draftDetail, Boolean draftPublished,
                           boolean hasDraft) {
        this.id = id;
        this.day = day;
        this.month = month;
        this.title = title;
        this.detail = detail;
        this.published = published;
        this.displayOrder = displayOrder;
        this.draftDay = draftDay;
        this.draftMonth = draftMonth;
        this.draftTitle = draftTitle;
        this.draftDetail = draftDetail;
        this.draftPublished = draftPublished;
        this.hasDraft = hasDraft;
    }

    public UUID getId() {
        return id;
    }

    public String getDay() {
        return day;
    }

    public String getMonth() {
        return month;
    }

    public String getTitle() {
        return title;
    }

    public String getDetail() {
        return detail;
    }

    public boolean isPublished() {
        return published;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public String getDraftDay() {
        return draftDay;
    }

    public String getDraftMonth() {
        return draftMonth;
    }

    public String getDraftTitle() {
        return draftTitle;
    }

    public String getDraftDetail() {
        return draftDetail;
    }

    public Boolean getDraftPublished() {
        return draftPublished;
    }

    public boolean isHasDraft() {
        return hasDraft;
    }
}
