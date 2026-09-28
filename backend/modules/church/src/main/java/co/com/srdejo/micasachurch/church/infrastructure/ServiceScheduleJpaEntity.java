package co.com.srdejo.micasachurch.church.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "service_schedules")
public class ServiceScheduleJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String day;

    @Column(nullable = false)
    private String time;

    private String note;

    @Column(nullable = false)
    private boolean streamed;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    protected ServiceScheduleJpaEntity() {
    }

    public ServiceScheduleJpaEntity(UUID id, String day, String time, String note, boolean streamed, int displayOrder,
                                    int durationMinutes) {
        this.id = id;
        this.day = day;
        this.time = time;
        this.note = note;
        this.streamed = streamed;
        this.displayOrder = displayOrder;
        this.durationMinutes = durationMinutes;
    }

    public int getDurationMinutes() {
        return durationMinutes;
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
