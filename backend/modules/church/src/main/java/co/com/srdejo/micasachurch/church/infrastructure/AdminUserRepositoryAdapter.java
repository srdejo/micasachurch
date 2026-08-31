package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class AdminUserRepositoryAdapter implements AdminUserRepository {

    private final AdminUserSpringDataRepository springDataRepository;

    public AdminUserRepositoryAdapter(AdminUserSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Optional<AdminUser> findByUsername(String username) {
        return springDataRepository.findByUsername(username).map(this::toDomain);
    }

    private AdminUser toDomain(AdminUserJpaEntity entity) {
        return new AdminUser(entity.getId(), entity.getUsername(), entity.getPasswordHash());
    }
}
