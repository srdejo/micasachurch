package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class Network {

    private final UUID id;
    private final String key;
    private String name;
    private String description;
    private String leadContact;

    public Network(UUID id, String key, String name, String description, String leadContact) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.description = description;
        this.leadContact = leadContact;
    }

    public static Network create(String name, String description, String leadContact) {
        UUID id = UUID.randomUUID();
        String key = "custom_" + id.toString().replace("-", "").substring(0, 12);
        return new Network(id, key, name, description, leadContact);
    }

    public void update(String name, String description, String leadContact) {
        this.name = name;
        this.description = description;
        this.leadContact = leadContact;
    }

    public UUID getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLeadContact() {
        return leadContact;
    }
}
