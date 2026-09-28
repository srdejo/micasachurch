package co.com.srdejo.micasachurch.church.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class LiveEvent {

    public static final int MIN_DURATION_MINUTES = 15;

    private final UUID id;
    private String title;
    private LocalDate date;
    private LocalTime startTime;
    private int durationMinutes;
    private String url;
    private boolean active;

    public LiveEvent(UUID id, String title, LocalDate date, LocalTime startTime, int durationMinutes, String url,
                     boolean active) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.durationMinutes = durationMinutes;
        this.url = url;
        this.active = active;
    }

    public static LiveEvent create(String title, LocalDate date, LocalTime startTime, int durationMinutes, String url,
                                   boolean active) {
        return new LiveEvent(UUID.randomUUID(), title.trim(), date, startTime, durationMinutes, url.trim(), active);
    }

    public static boolean isValidDuration(int durationMinutes) {
        return durationMinutes >= MIN_DURATION_MINUTES && durationMinutes % MIN_DURATION_MINUTES == 0;
    }

    public static boolean isValidUrl(String url) {
        return url != null && url.trim().matches("^https://\\S+$");
    }

    public void update(String title, LocalDate date, LocalTime startTime, int durationMinutes, String url, boolean active) {
        this.title = title.trim();
        this.date = date;
        this.startTime = startTime;
        this.durationMinutes = durationMinutes;
        this.url = url.trim();
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public String getUrl() {
        return url;
    }

    public boolean isActive() {
        return active;
    }
}
