package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class LinkEntry {

    private final UUID id;
    private final String key;
    private final String label;
    private String value;

    public LinkEntry(UUID id, String key, String label, String value) {
        this.id = id;
        this.key = key;
        this.label = label;
        this.value = value;
    }

    public void update(String value) {
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
