package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.PublishService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/publish")
public class AdminPublishController {

    private final PublishService publishService;

    public AdminPublishController(PublishService publishService) {
        this.publishService = publishService;
    }

    @GetMapping("/pending")
    @Transactional(readOnly = true)
    public PendingResponse pending() {
        return new PendingResponse(publishService.countPending());
    }

    @PostMapping
    @Transactional
    public PendingResponse publish() {
        int published = publishService.publishAll();
        return new PendingResponse(0, published);
    }

    public record PendingResponse(int pendingCount, Integer justPublished) {
        public PendingResponse(int pendingCount) {
            this(pendingCount, null);
        }
    }
}
