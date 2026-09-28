package co.com.srdejo.micasachurch.church.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiveEventRepository {

    List<LiveEvent> findAll();

    List<LiveEvent> findActiveFrom(LocalDate date);

    Optional<LiveEvent> findById(UUID id);

    LiveEvent save(LiveEvent liveEvent);

    void deleteById(UUID id);
}
