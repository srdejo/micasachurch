package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "live_events")
public class LiveEventJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private boolean active;

    protected LiveEventJpaEntity() {
    }

    public LiveEventJpaEntity(UUID id, String title, LocalDate date, LocalTime startTime, int durationMinutes, String url,
                              boolean active) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.durationMinutes = durationMinutes;
        this.url = url;
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
