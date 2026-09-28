package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface LiveEventSpringDataRepository extends JpaRepository<LiveEventJpaEntity, UUID> {

    List<LiveEventJpaEntity> findAllByOrderByDateAscStartTimeAsc();

    List<LiveEventJpaEntity> findByActiveTrueAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate date);
}
