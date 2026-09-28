package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.LiveEventService;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/live-events")
public class AdminLiveEventController {

    private final LiveEventService liveEventService;

    public AdminLiveEventController(LiveEventService liveEventService) {
        this.liveEventService = liveEventService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.LiveEventResponse> list() {
        return liveEventService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public PublicController.LiveEventResponse create(@RequestBody LiveEventRequest request) {
        return PublicController.toResponse(liveEventService.create(request.title(), request.date(), request.startTime(),
                request.durationMinutes(), request.url(), request.active()));
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.LiveEventResponse update(@PathVariable UUID id, @RequestBody LiveEventRequest request) {
        return PublicController.toResponse(liveEventService.update(id, request.title(), request.date(), request.startTime(),
                request.durationMinutes(), request.url(), request.active()));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        liveEventService.delete(id);
    }

    public record LiveEventRequest(String title, LocalDate date, @JsonFormat(pattern = "HH:mm") LocalTime startTime,
                                   int durationMinutes, String url, boolean active) {
    }
}
