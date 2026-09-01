package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.AdminUserService;
import co.com.srdejo.micasachurch.church.application.ChangePasswordUseCase;
import co.com.srdejo.micasachurch.church.application.ForgotPasswordUseCase;
import co.com.srdejo.micasachurch.church.application.LoginUseCase;
import co.com.srdejo.micasachurch.church.application.ResetPasswordUseCase;
import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.platform.security.JwtClaims;
import co.com.srdejo.micasachurch.platform.security.JwtService;
import co.com.srdejo.micasachurch.platform.webcommon.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminAuthController {

    private final LoginUseCase loginUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final ForgotPasswordUseCase forgotPasswordUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final AdminUserService adminUserService;
    private final JwtService jwtService;

    public AdminAuthController(LoginUseCase loginUseCase, ChangePasswordUseCase changePasswordUseCase,
                                ForgotPasswordUseCase forgotPasswordUseCase, ResetPasswordUseCase resetPasswordUseCase,
                                AdminUserService adminUserService, JwtService jwtService) {
        this.loginUseCase = loginUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.adminUserService = adminUserService;
        this.jwtService = jwtService;
    }

    @PostMapping("/api/admin/auth/login")
    @Transactional(readOnly = true)
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AdminUser adminUser = loginUseCase.login(request.username(), request.password());
        String token = jwtService.issue(new JwtClaims(adminUser.getId(), adminUser.getUsername()));
        return ApiResponse.ok(new LoginResponse(token, adminUser.getUsername()));
    }

    @PatchMapping("/api/admin/auth/change-password")
    @Transactional
    public void changePassword(@AuthenticationPrincipal JwtClaims claims, @Valid @RequestBody ChangePasswordRequest request) {
        changePasswordUseCase.changeOwnPassword(claims.adminId(), request.currentPassword(), request.newPassword());
    }

    @PatchMapping("/api/admin/auth/email")
    @Transactional
    public void updateOwnEmail(@AuthenticationPrincipal JwtClaims claims, @Valid @RequestBody UpdateEmailRequest request) {
        adminUserService.updateOwnEmail(claims.adminId(), request.email());
    }

    @PostMapping("/api/admin/auth/forgot-password")
    @Transactional
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        forgotPasswordUseCase.requestReset(request.username());
    }

    @PostMapping("/api/admin/auth/reset-password")
    @Transactional
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        resetPasswordUseCase.resetPassword(request.token(), request.newPassword());
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record LoginResponse(String token, String username) {
    }

    public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min = 8) String newPassword) {
    }

    public record UpdateEmailRequest(@NotBlank @Email String email) {
    }

    public record ForgotPasswordRequest(@NotBlank String username) {
    }

    public record ResetPasswordRequest(@NotBlank String token, @NotBlank @Size(min = 8) String newPassword) {
    }
}
