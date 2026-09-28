package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.HeroBannerService;
import co.com.srdejo.micasachurch.church.application.SiteImageService;
import co.com.srdejo.micasachurch.church.domain.HeroBanner;
import co.com.srdejo.micasachurch.church.domain.SiteImage;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminHeroBannerController {

    private final HeroBannerService heroBannerService;
    private final SiteImageService siteImageService;
    private final ImageStorage imageStorage;

    public AdminHeroBannerController(HeroBannerService heroBannerService, SiteImageService siteImageService,
                                     ImageStorage imageStorage) {
        this.heroBannerService = heroBannerService;
        this.siteImageService = siteImageService;
        this.imageStorage = imageStorage;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.HeroBannerResponse> list() {
        return heroBannerService.listAll().stream().map(this::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public PublicController.HeroBannerResponse create(@RequestBody CreateHeroBannerRequest request) {
        return toResponse(heroBannerService.create(request.title()));
    }

    @PatchMapping("/{id}")
    @Transactional
    public PublicController.HeroBannerResponse update(@PathVariable UUID id, @RequestBody HeroBannerRequest request) {
        return toResponse(heroBannerService.update(id, request.kicker(), request.title(), request.text(), request.ctaLabel(),
                request.ctaHref(), request.active()));
    }

    @PutMapping("/order")
    @Transactional
    public List<PublicController.HeroBannerResponse> reorder(@RequestBody List<UUID> orderedIds) {
        heroBannerService.reorder(orderedIds);
        return list();
    }

    @PostMapping("/{id}/image")
    @Transactional
    public PublicController.HeroBannerResponse uploadImage(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        heroBannerService.find(id);
        String key = HeroBanner.imageKeyFor(id);
        String filename = imageStorage.save(key, file);
        siteImageService.recordUpload(key, filename, file.getContentType());
        return toResponse(heroBannerService.changeImage(id, key));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        HeroBanner deleted = heroBannerService.delete(id);
        String ownKey = HeroBanner.imageKeyFor(id);
        // Seeded banners point at shared slots (hero, quienes_somos); only the banner's own upload is removed.
        if (ownKey.equals(deleted.getImageKey())) {
            siteImageService.findByKey(ownKey).map(SiteImage::getFilename).ifPresent(imageStorage::delete);
            siteImageService.delete(ownKey);
        }
    }

    private PublicController.HeroBannerResponse toResponse(HeroBanner heroBanner) {
        return PublicController.toResponse(heroBanner, Optional.ofNullable(heroBanner.getImageKey()).flatMap(siteImageService::findByKey));
    }

    public record CreateHeroBannerRequest(String title) {
    }

    public record HeroBannerRequest(String kicker, String title, String text, String ctaLabel, String ctaHref, boolean active) {
    }
}
