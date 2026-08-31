package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

public class ChangePasswordUseCase {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public ChangePasswordUseCase(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void changeOwnPassword(UUID adminId, String currentPassword, String newPassword) {
        AdminUser adminUser = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("adminuser.not_found"));
        if (!passwordEncoder.matches(currentPassword, adminUser.getPasswordHash())) {
            throw new BadCredentialsException("auth.invalid_credentials");
        }
        adminUser.changePasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(adminUser);
    }
}
