package co.com.srdejo.micasachurch.church.domain;

import java.time.Instant;
import java.util.UUID;

public class PrayerRequest {

    private UUID id;
    private final String name;
    private final String phone;
    private final String message;
    private final Instant createdAt;
    private boolean read;

    public PrayerRequest(UUID id, String name, String phone, String message, Instant createdAt, boolean read) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.message = message;
        this.createdAt = createdAt;
        this.read = read;
    }

    public static PrayerRequest create(String name, String phone, String message) {
        return new PrayerRequest(null, name, phone, message, Instant.now(), false);
    }

    public void markRead() {
        this.read = true;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getMessage() {
        return message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return read;
    }
}
