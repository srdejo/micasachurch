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
    public List<PublicController.EventResponse> list() {
        return eventService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public PublicController.EventResponse create(@Valid @RequestBody EventRequest request) {
        Event event = eventService.create(request.day(), request.month(), request.title(), request.detail(),
                request.published(), request.displayOrder());
        return PublicController.toResponse(event);
    }

    @PutMapping("/{id}")
    @Transactional
    public PublicController.EventResponse update(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        Event event = eventService.update(id, request.day(), request.month(), request.title(), request.detail(),
                request.published(), request.displayOrder());
        return PublicController.toResponse(event);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        eventService.delete(id);
    }

    public record EventRequest(@NotBlank String day, @NotBlank String month, @NotBlank String title, String detail,
                                boolean published, int displayOrder) {
    }
}
