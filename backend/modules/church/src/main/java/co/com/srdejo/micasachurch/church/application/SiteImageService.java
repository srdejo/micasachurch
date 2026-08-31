package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.SiteImage;
import co.com.srdejo.micasachurch.church.domain.SiteImageRepository;

import java.time.Instant;
import java.util.List;

public class SiteImageService {

    private final SiteImageRepository siteImageRepository;

    public SiteImageService(SiteImageRepository siteImageRepository) {
        this.siteImageRepository = siteImageRepository;
    }

    public List<SiteImage> listAll() {
        return siteImageRepository.findAll();
    }

    public SiteImage recordUpload(String key, String filename, String contentType) {
        SiteImage siteImage = siteImageRepository.findByKey(key)
                .map(existing -> {
                    existing.update(filename, contentType, Instant.now());
                    return existing;
                })
                .orElseGet(() -> new SiteImage(null, key, filename, contentType, Instant.now()));
        return siteImageRepository.save(siteImage);
    }
}
