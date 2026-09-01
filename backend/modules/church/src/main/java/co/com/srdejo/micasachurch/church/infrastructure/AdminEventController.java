package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.EventService;
import co.com.srdejo.micasachurch.church.domain.Event;
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
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminEventResponse> list() {
        return eventService.listAll().stream().map(AdminEventController::toAdminResponse).toList();
    }

    @PostMapping
    @Transactional
    public AdminEventResponse create(@Valid @RequestBody EventRequest request) {
        Event event = eventService.create(request.day(), request.month(), request.title(), request.detail(),
                request.published(), request.displayOrder());
        return toAdminResponse(event);
    }

    @PutMapping("/{id}")
    @Transactional
    public AdminEventResponse update(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        Event event = eventService.update(id, request.day(), request.month(), request.title(), request.detail(),
                request.published(), request.displayOrder());
        return toAdminResponse(event);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        eventService.delete(id);
    }

    private static AdminEventResponse toAdminResponse(Event event) {
        boolean hasDraft = event.hasDraft();
        return new AdminEventResponse(event.getId(),
                hasDraft ? event.getDraftDay() : event.getDay(),
                hasDraft ? event.getDraftMonth() : event.getMonth(),
                hasDraft ? event.getDraftTitle() : event.getTitle(),
                hasDraft ? event.getDraftDetail() : event.getDetail(),
                hasDraft ? Boolean.TRUE.equals(event.getDraftPublished()) : event.isPublished(),
                event.getDisplayOrder(), hasDraft);
    }

    public record EventRequest(@NotBlank String day, @NotBlank String month, @NotBlank String title, String detail,
                                boolean published, int displayOrder) {
    }

    public record AdminEventResponse(UUID id, String day, String month, String title, String detail, boolean published,
                                      int displayOrder, boolean hasDraft) {
    }
}
