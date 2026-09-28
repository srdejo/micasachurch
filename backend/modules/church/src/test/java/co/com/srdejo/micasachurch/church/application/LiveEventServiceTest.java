package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.LiveEvent;
import co.com.srdejo.micasachurch.church.domain.LiveEventRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LiveEventServiceTest {

    private static final String FACEBOOK = "https://www.facebook.com/micasachurchocana";
    private static final LocalDate OCT_10 = LocalDate.of(2026, 10, 10);
    private static final LocalTime SEVEN_PM = LocalTime.of(19, 0);

    private LiveEventService service;

    @BeforeEach
    void setUp() {
        // 2026-10-10 03:00 UTC is still 2026-10-09 22:00 in Bogotá.
        Clock clock = Clock.fixed(Instant.parse("2026-10-10T03:00:00Z"), ZoneOffset.UTC);
        service = new LiveEventService(new InMemoryLiveEvents(), clock);
    }

    @Test
    void rejectsDurationsBelowFifteenOrOffTheFifteenMinuteGrid() {
        for (int minutes : List.of(5, 0, 20, -15)) {
            assertThatThrownBy(() -> service.create("Noche de alabanza", OCT_10, SEVEN_PM, minutes, FACEBOOK, true))
                    .isInstanceOf(BusinessRuleException.class);
        }
    }

    @Test
    void rejectsLinksThatAreNotHttps() {
        for (String url : List.of("http://facebook.com/x", "javascript:alert(1)", "", "facebook.com")) {
            assertThatThrownBy(() -> service.create("Noche de alabanza", OCT_10, SEVEN_PM, 120, url, true))
                    .isInstanceOf(BusinessRuleException.class);
        }
    }

    @Test
    void requiresTitleDateAndTime() {
        assertThatThrownBy(() -> service.create(" ", OCT_10, SEVEN_PM, 120, FACEBOOK, true)).isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> service.create("X", null, SEVEN_PM, 120, FACEBOOK, true)).isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> service.create("X", OCT_10, null, 120, FACEBOOK, true)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void upcomingUsesTheChurchTimeZoneAndSkipsInactive() {
        service.create("Ayer en Bogotá", LocalDate.of(2026, 10, 8), SEVEN_PM, 120, FACEBOOK, true);
        service.create("Hoy en Bogotá", LocalDate.of(2026, 10, 9), SEVEN_PM, 120, FACEBOOK, true);
        service.create("Mañana", OCT_10, SEVEN_PM, 120, FACEBOOK, true);
        service.create("Inactiva", OCT_10, SEVEN_PM, 120, FACEBOOK, false);

        assertThat(service.listUpcomingActive()).extracting(LiveEvent::getTitle).containsExactly("Hoy en Bogotá", "Mañana");
    }

    private static class InMemoryLiveEvents implements LiveEventRepository {
        private final List<LiveEvent> events = new ArrayList<>();

        @Override
        public List<LiveEvent> findAll() {
            return events.stream().sorted(Comparator.comparing(LiveEvent::getDate).thenComparing(LiveEvent::getStartTime)).toList();
        }

        @Override
        public List<LiveEvent> findActiveFrom(LocalDate date) {
            return findAll().stream().filter(LiveEvent::isActive).filter(e -> !e.getDate().isBefore(date)).toList();
        }

        @Override
        public Optional<LiveEvent> findById(UUID id) {
            return events.stream().filter(e -> e.getId().equals(id)).findFirst();
        }

        @Override
        public LiveEvent save(LiveEvent liveEvent) {
            events.removeIf(e -> e.getId().equals(liveEvent.getId()));
            events.add(liveEvent);
            return liveEvent;
        }

        @Override
        public void deleteById(UUID id) {
            events.removeIf(e -> e.getId().equals(id));
        }
    }
}
