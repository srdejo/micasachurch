package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.AdminUserService;
import co.com.srdejo.micasachurch.church.domain.AdminUser;
import co.com.srdejo.micasachurch.platform.security.JwtClaims;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/admin-users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminUserResponse> list() {
        return adminUserService.listAll().stream().map(AdminUserController::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public AdminUserResponse create(@AuthenticationPrincipal JwtClaims claims, @Valid @RequestBody CreateAdminUserRequest request) {
        AdminUser adminUser = adminUserService.invite(request.username(), request.email(), claims.username());
        return toResponse(adminUser);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        adminUserService.delete(id);
    }

    private static AdminUserResponse toResponse(AdminUser adminUser) {
        return new AdminUserResponse(adminUser.getId(), adminUser.getUsername(), adminUser.getEmail());
    }

    public record CreateAdminUserRequest(@NotBlank String username, @NotBlank @Email String email) {
    }

    public record AdminUserResponse(UUID id, String username, String email) {
    }
}
