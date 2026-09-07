package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
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
@RequestMapping("/api/admin/services")
public class AdminServiceScheduleController {

    private final ServiceScheduleService serviceScheduleService;

    public AdminServiceScheduleController(ServiceScheduleService serviceScheduleService) {
        this.serviceScheduleService = serviceScheduleService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.ServiceScheduleResponse> list() {
        return serviceScheduleService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public PublicController.ServiceScheduleResponse get(@PathVariable UUID id) {
        return serviceScheduleService.listAll().stream().filter(s -> s.getId().equals(id)).findFirst()
                .map(PublicController::toResponse)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
    }

    @PostMapping
    @Transactional
    public PublicController.ServiceScheduleResponse create(@Valid @RequestBody CreateServiceScheduleRequest request) {
        return PublicController.toResponse(serviceScheduleService.create(request.day(), request.time(),
                request.note(), request.streamed()));
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.ServiceScheduleResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceScheduleRequest request) {
        return PublicController.toResponse(serviceScheduleService.update(id, request.day(), request.time(),
                request.note(), request.streamed()));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        serviceScheduleService.delete(id);
    }

    /** `day` es opcional: si no llega, el servicio conserva el dia que ya tenia. */
    public record ServiceScheduleRequest(String day, String time, String note, boolean streamed) {
    }

    public record CreateServiceScheduleRequest(@NotBlank String day, @NotBlank String time, String note, boolean streamed) {
    }
}
