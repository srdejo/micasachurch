package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.Ministry;
import co.com.srdejo.micasachurch.church.domain.MinistryRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class MinistryRepositoryAdapter implements MinistryRepository {

    private final MinistrySpringDataRepository springDataRepository;

    public MinistryRepositoryAdapter(MinistrySpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Ministry save(Ministry ministry) {
        MinistryJpaEntity entity = new MinistryJpaEntity(ministry.getId(), ministry.getName(), ministry.getDescription(),
                ministry.getDisplayOrder());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<Ministry> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Ministry> findAllOrdered() {
        return springDataRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    private Ministry toDomain(MinistryJpaEntity entity) {
        return new Ministry(entity.getId(), entity.getName(), entity.getDescription(), entity.getDisplayOrder());
    }
}
