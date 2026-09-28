package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.LiveEvent;
import co.com.srdejo.micasachurch.church.domain.LiveEventRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

public class LiveEventService {

    /** The church streams on Colombian time; "upcoming" must not depend on the server's zone. */
    public static final ZoneId CHURCH_ZONE = ZoneId.of("America/Bogota");

    private final LiveEventRepository liveEventRepository;
    private final Clock clock;

    public LiveEventService(LiveEventRepository liveEventRepository, Clock clock) {
        this.liveEventRepository = liveEventRepository;
        this.clock = clock;
    }

    public List<LiveEvent> listAll() {
        return liveEventRepository.findAll();
    }

    public List<LiveEvent> listUpcomingActive() {
        return liveEventRepository.findActiveFrom(LocalDate.now(clock.withZone(CHURCH_ZONE)));
    }

    public LiveEvent create(String title, LocalDate date, LocalTime startTime, int durationMinutes, String url, boolean active) {
        validate(title, date, startTime, durationMinutes, url);
        return liveEventRepository.save(LiveEvent.create(title, date, startTime, durationMinutes, url, active));
    }

    public LiveEvent update(UUID id, String title, LocalDate date, LocalTime startTime, int durationMinutes, String url,
                            boolean active) {
        validate(title, date, startTime, durationMinutes, url);
        LiveEvent liveEvent = find(id);
        liveEvent.update(title, date, startTime, durationMinutes, url, active);
        return liveEventRepository.save(liveEvent);
    }

    public void delete(UUID id) {
        find(id);
        liveEventRepository.deleteById(id);
    }

    private LiveEvent find(UUID id) {
        return liveEventRepository.findById(id).orElseThrow(() -> new NotFoundException("live_event.not_found"));
    }

    private static void validate(String title, LocalDate date, LocalTime startTime, int durationMinutes, String url) {
        if (title == null || title.isBlank() || date == null || startTime == null) {
            throw new BusinessRuleException("live_event.required_fields");
        }
        if (!LiveEvent.isValidDuration(durationMinutes)) {
            throw new BusinessRuleException("live_event.invalid_duration");
        }
        if (!LiveEvent.isValidUrl(url)) {
            throw new BusinessRuleException("live_event.invalid_url");
        }
    }
}
