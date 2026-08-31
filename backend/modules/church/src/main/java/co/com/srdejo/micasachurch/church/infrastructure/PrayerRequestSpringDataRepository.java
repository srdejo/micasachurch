package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrayerRequestSpringDataRepository extends JpaRepository<PrayerRequestJpaEntity, UUID> {

    List<PrayerRequestJpaEntity> findAllByOrderByCreatedAtDesc();

    long countByReadFalse();
}
