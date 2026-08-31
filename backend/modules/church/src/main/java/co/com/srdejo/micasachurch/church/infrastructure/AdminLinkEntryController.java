package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.LinkEntryService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/links")
public class AdminLinkEntryController {

    private final LinkEntryService linkEntryService;

    public AdminLinkEntryController(LinkEntryService linkEntryService) {
        this.linkEntryService = linkEntryService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.LinkEntryResponse> list() {
        return linkEntryService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.LinkEntryResponse update(@PathVariable UUID id, @Valid @RequestBody LinkEntryRequest request) {
        return PublicController.toResponse(linkEntryService.update(id, request.value()));
    }

    public record LinkEntryRequest(String value) {
    }
}
