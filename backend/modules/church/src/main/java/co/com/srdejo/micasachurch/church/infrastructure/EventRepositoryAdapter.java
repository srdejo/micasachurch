package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.Event;
import co.com.srdejo.micasachurch.church.domain.EventRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class EventRepositoryAdapter implements EventRepository {

    private final EventSpringDataRepository springDataRepository;

    public EventRepositoryAdapter(EventSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Event save(Event event) {
        EventJpaEntity entity = new EventJpaEntity(event.getId(), event.getDay(), event.getMonth(), event.getTitle(),
                event.getDetail(), event.isPublished(), event.getDisplayOrder(), event.getDraftDay(), event.getDraftMonth(),
                event.getDraftTitle(), event.getDraftDetail(), event.getDraftPublished(), event.hasDraft());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<Event> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Event> findAllPublishedOrdered() {
        return springDataRepository.findByPublishedTrueOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Event> findAllOrdered() {
        return springDataRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Event> findAllWithDraft() {
        return springDataRepository.findByHasDraftTrue().stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    private Event toDomain(EventJpaEntity entity) {
        return new Event(entity.getId(), entity.getDay(), entity.getMonth(), entity.getTitle(), entity.getDetail(),
                entity.isPublished(), entity.getDisplayOrder(), entity.getDraftDay(), entity.getDraftMonth(),
                entity.getDraftTitle(), entity.getDraftDetail(), entity.getDraftPublished(), entity.isHasDraft());
    }
}
