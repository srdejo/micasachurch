package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;

@Component
public class ImageStorage {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/webp", "image/svg+xml");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    private final Path uploadsDir;

    public ImageStorage(@Value("${app.uploads-dir:uploads}") String uploadsDir) {
        this.uploadsDir = Path.of(uploadsDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadsDir);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public String save(String key, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessRuleException("site_image.empty_file");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessRuleException("site_image.too_large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessRuleException("site_image.unsupported_type");
        }
        String extension = switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/svg+xml" -> ".svg";
            default -> "";
        };
        String filename = key + extension;
        try {
            Files.copy(file.getInputStream(), uploadsDir.resolve(filename), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return filename;
    }

    public Path resolve(String filename) {
        return uploadsDir.resolve(filename);
    }
}
