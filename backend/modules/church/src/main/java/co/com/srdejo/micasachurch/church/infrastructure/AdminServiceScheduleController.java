package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
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
                .orElseThrow(() -> new co.com.srdejo.micasachurch.platform.webcommon.NotFoundException("service_schedule.not_found"));
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.ServiceScheduleResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceScheduleRequest request) {
        return PublicController.toResponse(serviceScheduleService.update(id, request.time(), request.note(), request.streamed()));
    }

    public record ServiceScheduleRequest(String time, String note, boolean streamed) {
    }
}
