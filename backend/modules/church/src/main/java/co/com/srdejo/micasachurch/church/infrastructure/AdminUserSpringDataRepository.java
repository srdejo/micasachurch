package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminUserSpringDataRepository extends JpaRepository<AdminUserJpaEntity, UUID> {

    Optional<AdminUserJpaEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    List<AdminUserJpaEntity> findAllByOrderByUsernameAsc();
}
