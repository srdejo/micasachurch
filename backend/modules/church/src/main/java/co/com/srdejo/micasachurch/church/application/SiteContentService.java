package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.SiteContent;
import co.com.srdejo.micasachurch.church.domain.SiteContentRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class SiteContentService {

    private final SiteContentRepository siteContentRepository;

    public SiteContentService(SiteContentRepository siteContentRepository) {
        this.siteContentRepository = siteContentRepository;
    }

    public List<SiteContent> listAll() {
        return siteContentRepository.findAll();
    }

    public SiteContent update(UUID id, String value) {
        SiteContent siteContent = siteContentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("site_content.not_found"));
        siteContent.stageDraft(value);
        return siteContentRepository.save(siteContent);
    }

    public int publishPending() {
        List<SiteContent> pending = siteContentRepository.findAllWithDraft();
        for (SiteContent siteContent : pending) {
            siteContent.publishDraft();
            siteContentRepository.save(siteContent);
        }
        return pending.size();
    }

    public int countPending() {
        return siteContentRepository.findAllWithDraft().size();
    }
}
