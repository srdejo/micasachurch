package co.com.srdejo.micasachurch.church.application;

public class PublishService {

    private final EventService eventService;
    private final SiteContentService siteContentService;
    private final MinistryService ministryService;

    public PublishService(EventService eventService, SiteContentService siteContentService, MinistryService ministryService) {
        this.eventService = eventService;
        this.siteContentService = siteContentService;
        this.ministryService = ministryService;
    }

    public int countPending() {
        return eventService.countPending() + siteContentService.countPending() + ministryService.countPending();
    }

    public int publishAll() {
        return eventService.publishPending() + siteContentService.publishPending() + ministryService.publishPending();
    }
}
