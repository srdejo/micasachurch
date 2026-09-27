package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class SiteContent {

    private final UUID id;
    private final String key;
    private final String label;
    private final String section;
    private final int displayOrder;
    private String value;

    private String draftValue;
    private boolean hasDraft;

    public SiteContent(UUID id, String key, String label, String section, int displayOrder, String value,
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

    public void stageDraft(String value) {
        this.draftValue = value;
        this.hasDraft = true;
    }

    public void publishDraft() {
        if (!hasDraft) {
            return;
        }
        this.value = draftValue;
        this.draftValue = null;
        this.hasDraft = false;
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

    public boolean hasDraft() {
        return hasDraft;
    }
}
