package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminUser> listAll() {
        return adminUserRepository.findAllOrderedByUsername();
    }

    public AdminUser create(String username, String rawPassword) {
        if (adminUserRepository.existsByUsername(username)) {
            throw new BusinessRuleException("adminuser.username_taken");
        }
        return adminUserRepository.save(AdminUser.create(username, passwordEncoder.encode(rawPassword)));
    }

    public void delete(UUID id) {
        adminUserRepository.findById(id).orElseThrow(() -> new NotFoundException("adminuser.not_found"));
        if (adminUserRepository.count() <= 1) {
            throw new BusinessRuleException("adminuser.last_admin");
        }
        adminUserRepository.deleteById(id);
    }
}
