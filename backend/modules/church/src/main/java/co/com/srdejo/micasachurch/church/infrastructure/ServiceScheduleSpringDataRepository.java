package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceScheduleSpringDataRepository extends JpaRepository<ServiceScheduleJpaEntity, UUID> {

    List<ServiceScheduleJpaEntity> findAllByOrderByDisplayOrderAsc();
}
