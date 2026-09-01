package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.MinistryService;
import co.com.srdejo.micasachurch.church.domain.Ministry;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/ministries")
public class AdminMinistryController {

    private final MinistryService ministryService;

    public AdminMinistryController(MinistryService ministryService) {
        this.ministryService = ministryService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminMinistryResponse> list() {
        return ministryService.listAll().stream().map(AdminMinistryController::toAdminResponse).toList();
    }

    @PostMapping
    @Transactional
    public AdminMinistryResponse create(@Valid @RequestBody MinistryRequest request) {
        Ministry ministry = ministryService.create(request.name(), request.description(), request.displayOrder());
        return toAdminResponse(ministry);
    }

    @PutMapping("/{id}")
    @Transactional
    public AdminMinistryResponse update(@PathVariable UUID id, @Valid @RequestBody MinistryRequest request) {
        Ministry ministry = ministryService.update(id, request.name(), request.description(), request.displayOrder());
        return toAdminResponse(ministry);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        ministryService.delete(id);
    }

    private static AdminMinistryResponse toAdminResponse(Ministry ministry) {
        boolean hasDraft = ministry.hasDraft();
        return new AdminMinistryResponse(ministry.getId(),
                hasDraft ? ministry.getDraftName() : ministry.getName(),
                hasDraft ? ministry.getDraftDescription() : ministry.getDescription(),
                ministry.getDisplayOrder(), hasDraft);
    }

    public record MinistryRequest(@NotBlank String name, String description, int displayOrder) {
    }

    public record AdminMinistryResponse(UUID id, String name, String description, int displayOrder, boolean hasDraft) {
    }
}
