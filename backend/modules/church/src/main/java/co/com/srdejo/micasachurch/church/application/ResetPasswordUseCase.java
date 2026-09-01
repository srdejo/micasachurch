package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.church.domain.PasswordResetToken;
import co.com.srdejo.micasachurch.church.domain.PasswordResetTokenRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.springframework.security.crypto.password.PasswordEncoder;

public class ResetPasswordUseCase {

    private final AdminUserRepository adminUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public ResetPasswordUseCase(AdminUserRepository adminUserRepository,
                                 PasswordResetTokenRepository passwordResetTokenRepository,
                                 PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .filter(PasswordResetToken::isUsable)
                .orElseThrow(() -> new BusinessRuleException("auth.reset_token_invalid"));

        AdminUser adminUser = adminUserRepository.findById(resetToken.getAdminUserId())
                .orElseThrow(() -> new BusinessRuleException("auth.reset_token_invalid"));

        adminUser.changePasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(adminUser);

        resetToken.markUsed();
        passwordResetTokenRepository.save(resetToken);
    }
}
