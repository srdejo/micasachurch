package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SiteImageSpringDataRepository extends JpaRepository<SiteImageJpaEntity, UUID> {

    Optional<SiteImageJpaEntity> findByKey(String key);
}
