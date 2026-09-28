package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class ServiceSchedule {

    public static final int DEFAULT_DURATION_MINUTES = 120;
    public static final int MIN_DURATION_MINUTES = 15;

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
    /** Cuanto dura la transmision; el landing marca "En vivo" desde la hora de inicio hasta inicio + duracion. */
    private int durationMinutes;

    public ServiceSchedule(UUID id, String day, String time, String note, boolean streamed, int displayOrder,
                           int durationMinutes) {
        this.id = id;
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
        this.displayOrder = displayOrder;
        this.durationMinutes = durationMinutes;
    }

    public static ServiceSchedule create(String day, String time, String note, boolean streamed, int displayOrder,
                                         int durationMinutes) {
        return new ServiceSchedule(UUID.randomUUID(), day, time, note, streamed, displayOrder, durationMinutes);
    }

    public static boolean isValidDuration(int durationMinutes) {
        return durationMinutes >= MIN_DURATION_MINUTES;
    }

    public void update(String day, String time, String note, boolean streamed, int durationMinutes) {
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
        this.durationMinutes = durationMinutes;
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

    public int getDurationMinutes() {
        return durationMinutes;
    }
}
