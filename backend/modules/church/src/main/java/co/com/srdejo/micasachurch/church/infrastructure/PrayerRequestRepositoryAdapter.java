package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.PrayerRequest;
import co.com.srdejo.micasachurch.church.domain.PrayerRequestRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PrayerRequestRepositoryAdapter implements PrayerRequestRepository {

    private final PrayerRequestSpringDataRepository springDataRepository;

    public PrayerRequestRepositoryAdapter(PrayerRequestSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public PrayerRequest save(PrayerRequest prayerRequest) {
        PrayerRequestJpaEntity entity = new PrayerRequestJpaEntity(prayerRequest.getId(), prayerRequest.getName(),
                prayerRequest.getPhone(), prayerRequest.getMessage(), prayerRequest.getCreatedAt(), prayerRequest.isRead());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<PrayerRequest> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<PrayerRequest> findAllOrderByCreatedAtDesc() {
        return springDataRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDomain).toList();
    }

    @Override
    public long countUnread() {
        return springDataRepository.countByReadFalse();
    }

    private PrayerRequest toDomain(PrayerRequestJpaEntity entity) {
        return new PrayerRequest(entity.getId(), entity.getName(), entity.getPhone(), entity.getMessage(),
                entity.getCreatedAt(), entity.isRead());
    }
}
