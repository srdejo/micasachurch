package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.NetworkService;
import co.com.srdejo.micasachurch.church.domain.Network;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping
    @Transactional
    public PublicController.NetworkResponse create(@Valid @RequestBody NetworkRequest request) {
        Network network = networkService.create(request.name(), request.description(), request.leadContact());
        return PublicController.toResponse(network);
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.NetworkResponse update(@PathVariable UUID id, @Valid @RequestBody NetworkRequest request) {
        Network network = networkService.update(id, request.name(), request.description(), request.leadContact());
        return PublicController.toResponse(network);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        networkService.delete(id);
    }

    public record NetworkRequest(@NotBlank String name, String description, String leadContact) {
    }
}
