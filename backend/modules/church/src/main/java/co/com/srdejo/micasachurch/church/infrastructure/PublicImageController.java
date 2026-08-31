package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.SiteImage;
import co.com.srdejo.micasachurch.church.domain.SiteImageRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
public class PublicImageController {

    private final SiteImageRepository siteImageRepository;
    private final ImageStorage imageStorage;

    public PublicImageController(SiteImageRepository siteImageRepository, ImageStorage imageStorage) {
        this.siteImageRepository = siteImageRepository;
        this.imageStorage = imageStorage;
    }

    @GetMapping("/api/images/{key}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> get(@PathVariable String key) {
        SiteImage siteImage = siteImageRepository.findByKey(key).orElseThrow(() -> new NotFoundException("site_image.not_found"));
        Resource resource = new FileSystemResource(imageStorage.resolve(siteImage.getFilename()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(siteImage.getContentType()))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                .body(resource);
    }
}
