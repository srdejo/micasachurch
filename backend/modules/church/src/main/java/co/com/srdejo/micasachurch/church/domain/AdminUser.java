package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class AdminUser {

    private final UUID id;
    private final String username;
    private String passwordHash;
    private String email;

    public AdminUser(UUID id, String username, String passwordHash, String email) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
    }

    public static AdminUser create(String username, String passwordHash, String email) {
        return new AdminUser(null, username, passwordHash, email);
    }

    public void changePasswordHash(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    public void changeEmail(String email) {
        this.email = email;
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

    public String getEmail() {
        return email;
    }
}
