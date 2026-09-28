package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.ThemePalette;
import co.com.srdejo.micasachurch.church.domain.ThemePaletteRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ThemePaletteServiceTest {

    private InMemoryThemes repository;
    private ThemePaletteService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryThemes();
        repository.save(new ThemePalette("Naranja", "#fba504", "#9a5b00", "#fff1d2", 1));
        repository.save(new ThemePalette("Coral", "#ff6b35", "#b23a0f", "#ffe6da", 2));
        service = new ThemePaletteService(repository);
    }

    @Test
    void rejectsColorsThatAreNotSixDigitHex() {
        for (String invalid : List.of("naranja", "#fff", "fba504", "#gggggg")) {
            assertThatThrownBy(() -> service.update("Naranja", invalid, null, null))
                    .isInstanceOf(BusinessRuleException.class);
        }
        assertThat(repository.findByName("Naranja").orElseThrow().getAccentColor()).isEqualTo("#fba504");
    }

    @Test
    void normalizesToLowercaseAndKeepsUntouchedColors() {
        ThemePalette updated = service.update("Naranja", "#F89E1B", null, null);

        assertThat(updated.getAccentColor()).isEqualTo("#f89e1b");
        assertThat(updated.getDeepColor()).isEqualTo("#9a5b00");
        assertThat(updated.getSoftColor()).isEqualTo("#fff1d2");
    }

    @Test
    void unknownThemeIsNotFound() {
        assertThatThrownBy(() -> service.update("Verde", "#00ff00", null, null)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void activeThemeFallsBackToDefault() {
        assertThat(service.findActive("Coral").getName()).isEqualTo("Coral");
        assertThat(service.findActive("Borrado").getName()).isEqualTo("Naranja");
    }

    private static class InMemoryThemes implements ThemePaletteRepository {
        private final List<ThemePalette> themes = new ArrayList<>();

        @Override
        public List<ThemePalette> findAll() {
            return List.copyOf(themes);
        }

        @Override
        public Optional<ThemePalette> findByName(String name) {
            return themes.stream().filter(t -> t.getName().equals(name)).findFirst();
        }

        @Override
        public ThemePalette save(ThemePalette themePalette) {
            themes.removeIf(t -> t.getName().equals(themePalette.getName()));
            themes.add(themePalette);
            return themePalette;
        }
    }
}
