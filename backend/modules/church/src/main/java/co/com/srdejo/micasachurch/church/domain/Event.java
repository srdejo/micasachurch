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

    public Event(UUID id, String day, String month, String title, String detail, boolean published, int displayOrder) {
        this.id = id;
        this.day = day;
        this.month = month;
        this.title = title;
        this.detail = detail;
        this.published = published;
        this.displayOrder = displayOrder;
    }

    public static Event create(String day, String month, String title, String detail, boolean published, int displayOrder) {
        return new Event(null, day, month, title, detail, published, displayOrder);
    }

    public void update(String day, String month, String title, String detail, boolean published, int displayOrder) {
        this.day = day;
        this.month = month;
        this.title = title;
        this.detail = detail;
        this.published = published;
        this.displayOrder = displayOrder;
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
}
