package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminUserRepository {

    Optional<AdminUser> findByUsername(String username);

    Optional<AdminUser> findById(UUID id);

    List<AdminUser> findAllOrderedByUsername();

    boolean existsByUsername(String username);

    long count();

    AdminUser save(AdminUser adminUser);

    void deleteById(UUID id);
}
