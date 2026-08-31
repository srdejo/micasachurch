package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LinkEntrySpringDataRepository extends JpaRepository<LinkEntryJpaEntity, UUID> {
}
