package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.PrayerRequestService;
import co.com.srdejo.micasachurch.church.domain.PrayerRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/prayer-requests")
public class AdminPrayerRequestController {

    private final PrayerRequestService prayerRequestService;

    public AdminPrayerRequestController(PrayerRequestService prayerRequestService) {
        this.prayerRequestService = prayerRequestService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PrayerRequestResponse> list() {
        return prayerRequestService.listAll().stream().map(AdminPrayerRequestController::toResponse).toList();
    }

    @PatchMapping("/{id}")
    @Transactional
    public PrayerRequestResponse markRead(@PathVariable UUID id) {
        return toResponse(prayerRequestService.markRead(id));
    }

    private static PrayerRequestResponse toResponse(PrayerRequest prayerRequest) {
        return new PrayerRequestResponse(prayerRequest.getId(), prayerRequest.getName(), prayerRequest.getPhone(),
                prayerRequest.getMessage(), prayerRequest.getCreatedAt(), prayerRequest.isRead());
    }

    public record PrayerRequestResponse(UUID id, String name, String phone, String message, Instant createdAt,
                                         boolean read) {
    }
}
