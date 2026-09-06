package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class ServiceSchedule {

    private final UUID id;
    private String day;
    private String time;
    private String note;
    private boolean streamed;
    /**
     * Orden explicito en el sitio publico. `day` y `time` son texto libre ("Domingo", "8:30 a.m."),
     * asi que no sirven para ordenar; sin esta columna el orden lo decidia la base de datos.
     */
    private int displayOrder;

    public ServiceSchedule(UUID id, String day, String time, String note, boolean streamed, int displayOrder) {
        this.id = id;
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
        this.displayOrder = displayOrder;
    }

    public static ServiceSchedule create(String day, String time, String note, boolean streamed, int displayOrder) {
        return new ServiceSchedule(UUID.randomUUID(), day, time, note, streamed, displayOrder);
    }

    public void update(String day, String time, String note, boolean streamed) {
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public UUID getId() {
        return id;
    }

    public String getDay() {
        return day;
    }

    public String getTime() {
        return time;
    }

    public String getNote() {
        return note;
    }

    public boolean isStreamed() {
        return streamed;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
