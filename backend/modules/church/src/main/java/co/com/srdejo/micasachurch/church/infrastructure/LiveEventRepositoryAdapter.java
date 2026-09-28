package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.LiveEvent;
import co.com.srdejo.micasachurch.church.domain.LiveEventRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LiveEventRepositoryAdapter implements LiveEventRepository {

    private final LiveEventSpringDataRepository springDataRepository;

    public LiveEventRepositoryAdapter(LiveEventSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<LiveEvent> findAll() {
        return springDataRepository.findAllByOrderByDateAscStartTimeAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public List<LiveEvent> findActiveFrom(LocalDate date) {
        return springDataRepository.findByActiveTrueAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(date).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<LiveEvent> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public LiveEvent save(LiveEvent liveEvent) {
        LiveEventJpaEntity entity = new LiveEventJpaEntity(liveEvent.getId(), liveEvent.getTitle(), liveEvent.getDate(),
                liveEvent.getStartTime(), liveEvent.getDurationMinutes(), liveEvent.getUrl(), liveEvent.isActive());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    private LiveEvent toDomain(LiveEventJpaEntity entity) {
        return new LiveEvent(entity.getId(), entity.getTitle(), entity.getDate(), entity.getStartTime(),
                entity.getDurationMinutes(), entity.getUrl(), entity.isActive());
    }
}
