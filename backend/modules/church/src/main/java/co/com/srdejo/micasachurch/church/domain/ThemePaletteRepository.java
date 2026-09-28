package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;

public interface ThemePaletteRepository {

    List<ThemePalette> findAll();

    Optional<ThemePalette> findByName(String name);

    ThemePalette save(ThemePalette themePalette);
}
