package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.church.domain.PasswordResetToken;
import co.com.srdejo.micasachurch.church.domain.PasswordResetTokenRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

public class AdminUserService {

    private static final int INVITE_TTL_MINUTES = 60 * 24;

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetMailSender mailSender;
    private final String adminPublicUrl;

    public AdminUserService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
                             PasswordResetTokenRepository passwordResetTokenRepository, PasswordResetMailSender mailSender,
                             String adminPublicUrl) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailSender = mailSender;
        this.adminPublicUrl = adminPublicUrl;
    }

    public List<AdminUser> listAll() {
        return adminUserRepository.findAllOrderedByUsername();
    }

    /**
     * The new admin never types a password: they get invited by email and set it themselves through the
     * same reset-password flow, with a longer-lived token (1 day vs. 30 min for a plain reset).
     */
    public AdminUser invite(String username, String email, String invitedBy) {
        if (adminUserRepository.existsByUsername(username)) {
            throw new BusinessRuleException("adminuser.username_taken");
        }
        String unusablePasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        AdminUser adminUser = adminUserRepository.save(AdminUser.create(username, unusablePasswordHash, email));

        PasswordResetToken token = passwordResetTokenRepository.save(PasswordResetToken.issue(adminUser.getId(), INVITE_TTL_MINUTES));
        String inviteLink = adminPublicUrl + "/restablecer-clave?token=" + token.getToken();
        mailSender.sendInviteLink(email, username, invitedBy, inviteLink);

        return adminUser;
    }

    public AdminUser updateOwnEmail(UUID id, String email) {
        AdminUser adminUser = adminUserRepository.findById(id).orElseThrow(() -> new NotFoundException("adminuser.not_found"));
        adminUser.changeEmail(email);
        return adminUserRepository.save(adminUser);
    }

    public void delete(UUID id) {
        adminUserRepository.findById(id).orElseThrow(() -> new NotFoundException("adminuser.not_found"));
        if (adminUserRepository.count() <= 1) {
            throw new BusinessRuleException("adminuser.last_admin");
        }
        adminUserRepository.deleteById(id);
    }
}
