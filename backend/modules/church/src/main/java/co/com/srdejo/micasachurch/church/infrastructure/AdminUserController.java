package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.AdminUserService;
import co.com.srdejo.micasachurch.church.domain.AdminUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    public AdminUserResponse create(@Valid @RequestBody CreateAdminUserRequest request) {
        AdminUser adminUser = adminUserService.create(request.username(), request.password());
        return toResponse(adminUser);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        adminUserService.delete(id);
    }

    private static AdminUserResponse toResponse(AdminUser adminUser) {
        return new AdminUserResponse(adminUser.getId(), adminUser.getUsername());
    }

    public record CreateAdminUserRequest(@NotBlank String username, @NotBlank @Size(min = 8) String password) {
    }

    public record AdminUserResponse(UUID id, String username) {
    }
}
