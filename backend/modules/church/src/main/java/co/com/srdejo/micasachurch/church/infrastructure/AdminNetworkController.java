package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.NetworkService;
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
@RequestMapping("/api/admin/networks")
public class AdminNetworkController {

    private final NetworkService networkService;

    public AdminNetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.NetworkResponse> list() {
        return networkService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public PublicController.NetworkResponse get(@PathVariable UUID id) {
        return networkService.listAll().stream().filter(n -> n.getId().equals(id)).findFirst()
                .map(PublicController::toResponse)
                .orElseThrow(() -> new co.com.srdejo.micasachurch.platform.webcommon.NotFoundException("network.not_found"));
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.NetworkResponse update(@PathVariable UUID id, @Valid @RequestBody NetworkRequest request) {
        return PublicController.toResponse(networkService.update(id, request.description(), request.leadContact()));
    }

    public record NetworkRequest(String description, String leadContact) {
    }
}
