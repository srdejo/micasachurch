package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.EventService;
import co.com.srdejo.micasachurch.church.application.LinkEntryService;
import co.com.srdejo.micasachurch.church.application.MinistryService;
import co.com.srdejo.micasachurch.church.application.NetworkService;
import co.com.srdejo.micasachurch.church.application.PrayerRequestService;
import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
import co.com.srdejo.micasachurch.church.application.SiteContentService;
import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import co.com.srdejo.micasachurch.church.application.ThemePaletteService;
import co.com.srdejo.micasachurch.church.application.HeroBannerService;
import co.com.srdejo.micasachurch.church.application.LiveEventService;
import co.com.srdejo.micasachurch.church.application.SiteImageService;
import co.com.srdejo.micasachurch.church.domain.HeroBanner;
import co.com.srdejo.micasachurch.church.domain.LiveEvent;
import co.com.srdejo.micasachurch.church.domain.SiteImage;
import com.fasterxml.jackson.annotation.JsonFormat;
import co.com.srdejo.micasachurch.church.domain.Event;
import co.com.srdejo.micasachurch.church.domain.LinkEntry;
import co.com.srdejo.micasachurch.church.domain.Ministry;
import co.com.srdejo.micasachurch.church.domain.Network;
import co.com.srdejo.micasachurch.church.domain.ServiceSchedule;
import co.com.srdejo.micasachurch.church.domain.SiteContent;
import co.com.srdejo.micasachurch.church.domain.SiteSettings;
import co.com.srdejo.micasachurch.church.domain.ThemePalette;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class PublicController {

    private final EventService eventService;
    private final ServiceScheduleService serviceScheduleService;
    private final NetworkService networkService;
    private final LinkEntryService linkEntryService;
    private final SiteSettingsService siteSettingsService;
    private final PrayerRequestService prayerRequestService;
    private final MinistryService ministryService;
    private final SiteContentService siteContentService;
    private final ThemePaletteService themePaletteService;
    private final HeroBannerService heroBannerService;
    private final SiteImageService siteImageService;
    private final LiveEventService liveEventService;

    public PublicController(EventService eventService, ServiceScheduleService serviceScheduleService,
                             NetworkService networkService, LinkEntryService linkEntryService,
                             SiteSettingsService siteSettingsService, PrayerRequestService prayerRequestService,
                             MinistryService ministryService, SiteContentService siteContentService,
                             ThemePaletteService themePaletteService, HeroBannerService heroBannerService,
                             SiteImageService siteImageService, LiveEventService liveEventService) {
        this.themePaletteService = themePaletteService;
        this.heroBannerService = heroBannerService;
        this.siteImageService = siteImageService;
        this.liveEventService = liveEventService;
        this.eventService = eventService;
        this.serviceScheduleService = serviceScheduleService;
        this.networkService = networkService;
        this.linkEntryService = linkEntryService;
        this.siteSettingsService = siteSettingsService;
        this.prayerRequestService = prayerRequestService;
        this.ministryService = ministryService;
        this.siteContentService = siteContentService;
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
        SiteSettings siteSettings = siteSettingsService.get();
        return toResponse(siteSettings, themePaletteService.findActive(siteSettings.getActiveTheme()));
    }

    @GetMapping("/api/banners")
    @Transactional(readOnly = true)
    public List<HeroBannerResponse> banners() {
        return heroBannerService.listActive().stream()
                .map(banner -> toResponse(banner, Optional.ofNullable(banner.getImageKey()).flatMap(siteImageService::findByKey)))
                .toList();
    }

    @GetMapping("/api/live-events")
    @Transactional(readOnly = true)
    public List<LiveEventResponse> liveEvents() {
        return liveEventService.listUpcomingActive().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/ministries")
    @Transactional(readOnly = true)
    public List<MinistryResponse> ministries() {
        return ministryService.listPublished().stream().map(PublicController::toResponse).toList();
    }

    @GetMapping("/api/site-content")
    @Transactional(readOnly = true)
    public List<SiteContentResponse> siteContent() {
        return siteContentService.listAll().stream().map(PublicController::toResponse).toList();
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
                serviceSchedule.getNote(), serviceSchedule.isStreamed(), serviceSchedule.getDisplayOrder(),
                serviceSchedule.getDurationMinutes());
    }

    static NetworkResponse toResponse(Network network) {
        return new NetworkResponse(network.getId(), network.getKey(), network.getName(), network.getDescription(),
                network.getLeadContact());
    }

    static LinkEntryResponse toResponse(LinkEntry linkEntry) {
        return new LinkEntryResponse(linkEntry.getId(), linkEntry.getKey(), linkEntry.getLabel(), linkEntry.getValue());
    }

    static SiteSettingsResponse toResponse(SiteSettings siteSettings, ThemePalette activeTheme) {
        return new SiteSettingsResponse(siteSettings.isLiveBannerVisible(), activeTheme.getName(),
                activeTheme.getAccentColor(), activeTheme.getDeepColor(), activeTheme.getSoftColor());
    }

    /** imageKey is only sent when the image was actually uploaded, so the site never renders a broken image. */
    static HeroBannerResponse toResponse(HeroBanner heroBanner, Optional<SiteImage> image) {
        return new HeroBannerResponse(heroBanner.getId(), heroBanner.getKicker(), heroBanner.getTitle(), heroBanner.getText(),
                heroBanner.getCtaLabel(), heroBanner.getCtaHref(), image.map(SiteImage::getKey).orElse(null),
                image.map(SiteImage::getUpdatedAt).orElse(null), heroBanner.isActive(), heroBanner.getDisplayOrder());
    }

    static LiveEventResponse toResponse(LiveEvent liveEvent) {
        return new LiveEventResponse(liveEvent.getId(), liveEvent.getTitle(), liveEvent.getDate(), liveEvent.getStartTime(),
                liveEvent.getDurationMinutes(), liveEvent.getUrl(), liveEvent.isActive());
    }

    static ThemePaletteResponse toResponse(ThemePalette themePalette) {
        return new ThemePaletteResponse(themePalette.getName(), themePalette.getAccentColor(), themePalette.getDeepColor(),
                themePalette.getSoftColor());
    }

    static MinistryResponse toResponse(Ministry ministry) {
        return new MinistryResponse(ministry.getId(), ministry.getName(), ministry.getDescription(), ministry.getDisplayOrder());
    }

    static SiteContentResponse toResponse(SiteContent siteContent) {
        return new SiteContentResponse(siteContent.getId(), siteContent.getKey(), siteContent.getLabel(),
                siteContent.getSection(), siteContent.getValue());
    }

    static SiteImageResponse toResponse(SiteImage siteImage) {
        return new SiteImageResponse(siteImage.getId(), siteImage.getKey(), siteImage.getUpdatedAt());
    }

    public record PrayerRequestSubmission(String name, String phone, String message) {
    }

    public record PrayerRequestResponse(java.util.UUID id) {
    }

    public record EventResponse(java.util.UUID id, String day, String month, String title, String detail,
                                 boolean published, int displayOrder) {
    }

    public record ServiceScheduleResponse(java.util.UUID id, String day, String time, String note, boolean streamed,
                                          int displayOrder, int durationMinutes) {
    }

    public record NetworkResponse(java.util.UUID id, String key, String name, String description, String leadContact) {
    }

    public record LinkEntryResponse(java.util.UUID id, String key, String label, String value) {
    }

    public record SiteSettingsResponse(boolean liveBannerVisible, String activeTheme, String accentColor, String deepColor,
                                       String softColor) {
    }

    public record HeroBannerResponse(java.util.UUID id, String kicker, String title, String text, String ctaLabel,
                                     String ctaHref, String imageKey, java.time.Instant imageUpdatedAt, boolean active,
                                     int displayOrder) {
    }

    public record LiveEventResponse(java.util.UUID id, String title, java.time.LocalDate date,
                                    @JsonFormat(pattern = "HH:mm") java.time.LocalTime startTime, int durationMinutes,
                                    String url, boolean active) {
    }

    public record ThemePaletteResponse(String name, String accentColor, String deepColor, String softColor) {
    }

    public record MinistryResponse(java.util.UUID id, String name, String description, int displayOrder) {
    }

    public record SiteContentResponse(java.util.UUID id, String key, String label, String section, String value) {
    }

    public record SiteImageResponse(java.util.UUID id, String key, java.time.Instant updatedAt) {
    }
}
