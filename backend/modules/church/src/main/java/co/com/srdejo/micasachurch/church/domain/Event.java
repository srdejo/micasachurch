package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class Event {

    private UUID id;
    private String day;
    private String month;
    private String title;
    private String detail;
    private boolean published;
    private int displayOrder;

    private String draftDay;
    private String draftMonth;
    private String draftTitle;
    private String draftDetail;
    private Boolean draftPublished;
    private boolean hasDraft;

    public Event(UUID id, String day, String month, String title, String detail, boolean published, int displayOrder,
                 String draftDay, String draftMonth, String draftTitle, String draftDetail, Boolean draftPublished, boolean hasDraft) {
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

    /**
     * A brand-new event starts hidden (live values blank/unpublished) with everything the admin entered
     * staged as a pending draft — it only becomes visible once someone publishes the change queue.
     */
    public static Event createDraft(String day, String month, String title, String detail, boolean published, int displayOrder) {
        Event event = new Event(null, "", "", "", "", false, displayOrder, null, null, null, null, null, false);
        event.stageDraft(day, month, title, detail, published);
        return event;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void stageDraft(String day, String month, String title, String detail, boolean published) {
        this.draftDay = day;
        this.draftMonth = month;
        this.draftTitle = title;
        this.draftDetail = detail;
        this.draftPublished = published;
        this.hasDraft = true;
    }

    public void publishDraft() {
        if (!hasDraft) {
            return;
        }
        this.day = draftDay;
        this.month = draftMonth;
        this.title = draftTitle;
        this.detail = draftDetail;
        this.published = draftPublished != null && draftPublished;
        this.draftDay = null;
        this.draftMonth = null;
        this.draftTitle = null;
        this.draftDetail = null;
        this.draftPublished = null;
        this.hasDraft = false;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public boolean hasDraft() {
        return hasDraft;
    }
}
