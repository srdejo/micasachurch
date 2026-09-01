package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.church.domain.PasswordResetToken;
import co.com.srdejo.micasachurch.church.domain.PasswordResetTokenRepository;

public class ForgotPasswordUseCase {

    private static final int TOKEN_TTL_MINUTES = 60;

    private final AdminUserRepository adminUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetMailSender mailSender;
    private final String resetLinkBaseUrl;

    public ForgotPasswordUseCase(AdminUserRepository adminUserRepository,
                                  PasswordResetTokenRepository passwordResetTokenRepository,
                                  PasswordResetMailSender mailSender, String resetLinkBaseUrl) {
        this.adminUserRepository = adminUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailSender = mailSender;
        this.resetLinkBaseUrl = resetLinkBaseUrl;
    }

    public void requestReset(String username) {
        AdminUser adminUser = adminUserRepository.findByUsername(username).orElse(null);
        if (adminUser == null || adminUser.getEmail() == null || adminUser.getEmail().isBlank()) {
            return;
        }
        PasswordResetToken token = passwordResetTokenRepository.save(PasswordResetToken.issue(adminUser.getId(), TOKEN_TTL_MINUTES));
        String resetLink = resetLinkBaseUrl + "/restablecer-clave?token=" + token.getToken();
        mailSender.sendResetLink(adminUser.getEmail(), resetLink);
    }
}
