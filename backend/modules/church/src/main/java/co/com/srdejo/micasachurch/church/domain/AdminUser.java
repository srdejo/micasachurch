package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class AdminUser {

    private final UUID id;
    private final String username;
    private final String passwordHash;

    public AdminUser(UUID id, String username, String passwordHash) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}
