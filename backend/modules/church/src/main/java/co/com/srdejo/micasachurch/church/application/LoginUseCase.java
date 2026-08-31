package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

public class LoginUseCase {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginUseCase(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminUser login(String username, String password) {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("auth.invalid_credentials"));
        if (!passwordEncoder.matches(password, adminUser.getPasswordHash())) {
            throw new BadCredentialsException("auth.invalid_credentials");
        }
        return adminUser;
    }
}
