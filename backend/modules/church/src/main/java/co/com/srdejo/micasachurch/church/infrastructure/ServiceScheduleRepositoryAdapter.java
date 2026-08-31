package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.ServiceSchedule;
import co.com.srdejo.micasachurch.church.domain.ServiceScheduleRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ServiceScheduleRepositoryAdapter implements ServiceScheduleRepository {

    private final ServiceScheduleSpringDataRepository springDataRepository;

    public ServiceScheduleRepositoryAdapter(ServiceScheduleSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public ServiceSchedule save(ServiceSchedule serviceSchedule) {
        ServiceScheduleJpaEntity entity = new ServiceScheduleJpaEntity(serviceSchedule.getId(), serviceSchedule.getDay(),
                serviceSchedule.getTime(), serviceSchedule.getNote(), serviceSchedule.isStreamed());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<ServiceSchedule> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ServiceSchedule> findAll() {
        return springDataRepository.findAll().stream().map(this::toDomain).toList();
    }

    private ServiceSchedule toDomain(ServiceScheduleJpaEntity entity) {
        return new ServiceSchedule(entity.getId(), entity.getDay(), entity.getTime(), entity.getNote(), entity.isStreamed());
    }
}
