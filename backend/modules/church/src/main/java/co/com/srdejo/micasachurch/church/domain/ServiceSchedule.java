package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;

public class ServiceSchedule {

    private final UUID id;
    private final String day;
    private String time;
    private String note;

    public ServiceSchedule(UUID id, String day, String time, String note) {
        this.id = id;
        this.day = day;
        this.time = time;
        this.note = note;
    }

    public void update(String time, String note) {
        this.time = time;
        this.note = note;
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
}
