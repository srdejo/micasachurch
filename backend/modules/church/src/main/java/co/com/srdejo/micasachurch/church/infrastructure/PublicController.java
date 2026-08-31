package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.EventService;
import co.com.srdejo.micasachurch.church.application.LinkEntryService;
import co.com.srdejo.micasachurch.church.application.NetworkService;
import co.com.srdejo.micasachurch.church.application.PrayerRequestService;
import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import co.com.srdejo.micasachurch.church.domain.Event;
import co.com.srdejo.micasachurch.church.domain.LinkEntry;
import co.com.srdejo.micasachurch.church.domain.Network;
import co.com.srdejo.micasachurch.church.domain.ServiceSchedule;
import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PublicController {

    private final EventService eventService;
    private final ServiceScheduleService serviceScheduleService;
    private final NetworkService networkService;
    private final LinkEntryService linkEntryService;
    private final SiteSettingsService siteSettingsService;
    private final PrayerRequestService prayerRequestService;

    public PublicController(EventService eventService, ServiceScheduleService serviceScheduleService,
                             NetworkService networkService, LinkEntryService linkEntryService,
                             SiteSettingsService siteSettingsService, PrayerRequestService prayerRequestService) {
        this.eventService = eventService;
        this.serviceScheduleService = serviceScheduleService;
        this.networkService = networkService;
        this.linkEntryService = linkEntryService;
        this.siteSettingsService = siteSettingsService;
        this.prayerRequestService = prayerRequestService;
    }

    @GetMapping("/api/events")
    @Transactional(readOnly = true)
    public List<EventResponse> events() {
        return eventService.listPublished().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/services")
    @Transactional(readOnly = true)
    public List<ServiceScheduleResponse> services() {
        return serviceScheduleService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/networks")
    @Transactional(readOnly = true)
    public List<NetworkResponse> networks() {
        return networkService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/links")
    @Transactional(readOnly = true)
    public List<LinkEntryResponse> links() {
        return linkEntryService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/site-settings")
    @Transactional(readOnly = true)
    public SiteSettingsResponse siteSettings() {
        return toResponse(siteSettingsService.get());
    }

    @PostMapping("/api/prayer-requests")
    @Transactional
    public PrayerRequestResponse submitPrayerRequest(@Valid @RequestBody PrayerRequestSubmission request) {
        var prayerRequest = prayerRequestService.submit(request.name(), request.phone(), request.message());
        return new PrayerRequestResponse(prayerRequest.getId());
    }

    static EventResponse toResponse(Event event) {
        return new EventResponse(event.getId(), event.getDay(), event.getMonth(), event.getTitle(), event.getDetail(),
                event.isPublished(), event.getDisplayOrder());
    }

    static ServiceScheduleResponse toResponse(ServiceSchedule serviceSchedule) {
        return new ServiceScheduleResponse(serviceSchedule.getId(), serviceSchedule.getDay(), serviceSchedule.getTime(),
                serviceSchedule.getNote());
    }

    static NetworkResponse toResponse(Network network) {
        return new NetworkResponse(network.getId(), network.getKey(), network.getName(), network.getDescription(),
                network.getLeadContact());
    }

    static LinkEntryResponse toResponse(LinkEntry linkEntry) {
        return new LinkEntryResponse(linkEntry.getId(), linkEntry.getKey(), linkEntry.getLabel(), linkEntry.getValue());
    }

    static SiteSettingsResponse toResponse(SiteSettings siteSettings) {
        return new SiteSettingsResponse(siteSettings.isLiveBannerVisible());
    }

    public record PrayerRequestSubmission(String name, String phone, @NotBlank String message) {
    }

    public record PrayerRequestResponse(java.util.UUID id) {
    }

    public record EventResponse(java.util.UUID id, String day, String month, String title, String detail,
                                 boolean published, int displayOrder) {
    }

    public record ServiceScheduleResponse(java.util.UUID id, String day, String time, String note) {
    }

    public record NetworkResponse(java.util.UUID id, String key, String name, String description, String leadContact) {
    }

    public record LinkEntryResponse(java.util.UUID id, String key, String label, String value) {
    }

    public record SiteSettingsResponse(boolean liveBannerVisible) {
    }
}
