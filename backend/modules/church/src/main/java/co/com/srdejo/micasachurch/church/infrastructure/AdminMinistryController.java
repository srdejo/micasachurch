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
    public List<PublicController.MinistryResponse> list() {
        return ministryService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public PublicController.MinistryResponse create(@Valid @RequestBody MinistryRequest request) {
        Ministry ministry = ministryService.create(request.name(), request.description(), request.displayOrder());
        return PublicController.toResponse(ministry);
    }

    @PutMapping("/{id}")
    @Transactional
    public PublicController.MinistryResponse update(@PathVariable UUID id, @Valid @RequestBody MinistryRequest request) {
        Ministry ministry = ministryService.update(id, request.name(), request.description(), request.displayOrder());
        return PublicController.toResponse(ministry);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        ministryService.delete(id);
    }

    public record MinistryRequest(@NotBlank String name, String description, int displayOrder) {
    }
}
