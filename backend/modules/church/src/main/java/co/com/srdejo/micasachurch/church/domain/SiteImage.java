package co.com.srdejo.micasachurch.church.domain;

import java.time.Instant;
import java.util.UUID;

public class SiteImage {

    private final UUID id;
    private final String key;
    private String filename;
    private String contentType;
    private Instant updatedAt;

    public SiteImage(UUID id, String key, String filename, String contentType, Instant updatedAt) {
        this.id = id;
        this.key = key;
        this.filename = filename;
        this.contentType = contentType;
        this.updatedAt = updatedAt;
    }

    public void update(String filename, String contentType, Instant updatedAt) {
        this.filename = filename;
        this.contentType = contentType;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
