package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class Ministry {

    private final UUID id;
    private String name;
    private String description;
    private int displayOrder;

    public Ministry(UUID id, String name, String description, int displayOrder) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
    }

    public static Ministry create(String name, String description, int displayOrder) {
        return new Ministry(null, name, description, displayOrder);
    }

    public void update(String name, String description, int displayOrder) {
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
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
}
