package co.com.srdejo.micasachurch.church.domain;

import java.time.Instant;
import java.util.UUID;

public class PasswordResetToken {

    private final UUID id;
    private final UUID adminUserId;
    private final String token;
    private final Instant expiresAt;
    private boolean used;

    public PasswordResetToken(UUID id, UUID adminUserId, String token, Instant expiresAt, boolean used) {
        this.id = id;
        this.adminUserId = adminUserId;
        this.token = token;
        this.expiresAt = expiresAt;
        this.used = used;
    }

    public static PasswordResetToken issue(UUID adminUserId, int ttlMinutes) {
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return new PasswordResetToken(null, adminUserId, token, Instant.now().plusSeconds(ttlMinutes * 60L), false);
    }

    public boolean isUsable() {
        return !used && Instant.now().isBefore(expiresAt);
    }

    public void markUsed() {
        this.used = true;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAdminUserId() {
        return adminUserId;
    }

    public String getToken() {
        return token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isUsed() {
        return used;
    }
}
