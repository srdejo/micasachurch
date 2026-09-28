package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.ThemePaletteService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/themes")
public class AdminThemePaletteController {

    private final ThemePaletteService themePaletteService;

    public AdminThemePaletteController(ThemePaletteService themePaletteService) {
        this.themePaletteService = themePaletteService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicController.ThemePaletteResponse> list() {
        return themePaletteService.listAll().stream().map(PublicController::toResponse).toList();
    }

    @PatchMapping("/{name}")
    @Transactional
    public PublicController.ThemePaletteResponse update(@PathVariable String name, @RequestBody ThemePaletteRequest request) {
        return PublicController.toResponse(themePaletteService.update(name, request.accentColor(), request.deepColor(),
                request.softColor()));
    }

    public record ThemePaletteRequest(String accentColor, String deepColor, String softColor) {
    }
}
