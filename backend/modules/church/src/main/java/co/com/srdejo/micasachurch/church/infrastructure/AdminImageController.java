package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.SiteImageService;
import co.com.srdejo.micasachurch.church.domain.SiteImage;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/images")
public class AdminImageController {

    private static final Set<String> ALLOWED_KEYS = Set.of("logo", "hero", "quienes_somos", "og_image");

    private final ImageStorage imageStorage;
    private final SiteImageService siteImageService;

    public AdminImageController(ImageStorage imageStorage, SiteImageService siteImageService) {
        this.imageStorage = imageStorage;
        this.siteImageService = siteImageService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.SiteImageResponse> list() {
        return siteImageService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PostMapping("/{key}")
    @Transactional
    public PublicController.SiteImageResponse upload(@PathVariable String key, @RequestParam("file") MultipartFile file) {
        if (!ALLOWED_KEYS.contains(key)) {
            throw new BusinessRuleException("site_image.unknown_key");
        }
        String filename = imageStorage.save(key, file);
        SiteImage siteImage = siteImageService.recordUpload(key, filename, file.getContentType());
        return PublicController.toResponse(siteImage);
    }
}
