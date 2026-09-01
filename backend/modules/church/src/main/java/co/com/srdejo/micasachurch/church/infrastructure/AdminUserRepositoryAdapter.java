package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @Override
    public Optional<AdminUser> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<AdminUser> findAllOrderedByUsername() {
        return springDataRepository.findAllByOrderByUsernameAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public boolean existsByUsername(String username) {
        return springDataRepository.existsByUsername(username);
    }

    @Override
    public long count() {
        return springDataRepository.count();
    }

    @Override
    public AdminUser save(AdminUser adminUser) {
        AdminUserJpaEntity entity = new AdminUserJpaEntity(adminUser.getId(), adminUser.getUsername(), adminUser.getPasswordHash(),
                adminUser.getEmail());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    private AdminUser toDomain(AdminUserJpaEntity entity) {
        return new AdminUser(entity.getId(), entity.getUsername(), entity.getPasswordHash(), entity.getEmail());
    }
}
