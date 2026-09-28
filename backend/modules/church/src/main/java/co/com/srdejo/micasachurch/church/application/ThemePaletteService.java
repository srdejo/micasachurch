package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.ThemePalette;
import co.com.srdejo.micasachurch.church.domain.ThemePaletteRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.stream.Stream;

public class ThemePaletteService {

    private final ThemePaletteRepository themePaletteRepository;

    public ThemePaletteService(ThemePaletteRepository themePaletteRepository) {
        this.themePaletteRepository = themePaletteRepository;
    }

    public List<ThemePalette> listAll() {
        return themePaletteRepository.findAll();
    }

    /** Falls back to the brand default so a broken reference never leaves the site without colors. */
    public ThemePalette findActive(String name) {
        return themePaletteRepository.findByName(name)
                .or(() -> themePaletteRepository.findByName(ThemePalette.DEFAULT_THEME))
                .orElseThrow(() -> new NotFoundException("theme.not_found"));
    }

    public ThemePalette update(String name, String accentColor, String deepColor, String softColor) {
        boolean invalid = Stream.of(accentColor, deepColor, softColor)
                .anyMatch(color -> color != null && !ThemePalette.isValidColor(color));
        if (invalid) {
            throw new BusinessRuleException("theme.invalid_color");
        }
        ThemePalette themePalette = themePaletteRepository.findByName(name)
                .orElseThrow(() -> new NotFoundException("theme.not_found"));
        themePalette.changeColors(accentColor, deepColor, softColor);
        return themePaletteRepository.save(themePalette);
    }
}
