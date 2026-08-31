package co.com.srdejo.micasachurch.church.domain;

import java.util.Optional;

public interface AdminUserRepository {

    Optional<AdminUser> findByUsername(String username);
}
