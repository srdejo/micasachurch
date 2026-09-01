package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class Ministry {

    private final UUID id;
    private String name;
    private String description;
    private int displayOrder;
    private boolean published;

    private String draftName;
    private String draftDescription;
    private Boolean draftPublished;
    private boolean hasDraft;

    public Ministry(UUID id, String name, String description, int displayOrder, boolean published, String draftName,
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

    /**
     * A brand-new ministry starts hidden (live name/description blank, unpublished) with everything the
     * admin entered staged as a pending draft — it only becomes visible once the change queue is published.
     */
    public static Ministry createDraft(String name, String description, int displayOrder) {
        Ministry ministry = new Ministry(null, "", "", displayOrder, false, null, null, null, false);
        ministry.stageDraft(name, description, true);
        return ministry;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void stageDraft(String name, String description, boolean published) {
        this.draftName = name;
        this.draftDescription = description;
        this.draftPublished = published;
        this.hasDraft = true;
    }

    public void publishDraft() {
        if (!hasDraft) {
            return;
        }
        this.name = draftName;
        this.description = draftDescription;
        this.published = draftPublished != null && draftPublished;
        this.draftName = null;
        this.draftDescription = null;
        this.draftPublished = null;
        this.hasDraft = false;
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

    public boolean hasDraft() {
        return hasDraft;
    }
}
