package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository {

    Event save(Event event);

    Optional<Event> findById(UUID id);

    List<Event> findAllPublishedOrdered();

    List<Event> findAllOrdered();

    List<Event> findAllWithDraft();

    void deleteById(UUID id);
}
