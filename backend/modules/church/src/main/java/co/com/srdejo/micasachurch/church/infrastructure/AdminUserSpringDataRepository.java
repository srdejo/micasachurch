package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminUserSpringDataRepository extends JpaRepository<AdminUserJpaEntity, UUID> {

    Optional<AdminUserJpaEntity> findByUsername(String username);
}
