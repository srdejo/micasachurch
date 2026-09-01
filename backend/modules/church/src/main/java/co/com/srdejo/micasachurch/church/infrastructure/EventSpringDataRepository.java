package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventSpringDataRepository extends JpaRepository<EventJpaEntity, UUID> {

    List<EventJpaEntity> findByPublishedTrueOrderByDisplayOrderAsc();

    List<EventJpaEntity> findAllByOrderByDisplayOrderAsc();

    List<EventJpaEntity> findByHasDraftTrue();
}
