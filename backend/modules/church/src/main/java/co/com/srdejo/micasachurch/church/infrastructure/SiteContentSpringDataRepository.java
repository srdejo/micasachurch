package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SiteContentSpringDataRepository extends JpaRepository<SiteContentJpaEntity, UUID> {
}
