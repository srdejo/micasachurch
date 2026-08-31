package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class ServiceSchedule {

    private final UUID id;
    private final String day;
    private String time;
    private String note;
    private boolean streamed;

    public ServiceSchedule(UUID id, String day, String time, String note, boolean streamed) {
        this.id = id;
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
    }

    public void update(String time, String note, boolean streamed) {
        this.time = time;
        this.note = note;
        this.streamed = streamed;
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
}
