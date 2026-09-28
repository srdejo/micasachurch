package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.ThemePalette;
import co.com.srdejo.micasachurch.church.domain.ThemePaletteRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ThemePaletteRepositoryAdapter implements ThemePaletteRepository {

    private final ThemePaletteSpringDataRepository springDataRepository;

    public ThemePaletteRepositoryAdapter(ThemePaletteSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<ThemePalette> findAll() {
        return springDataRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<ThemePalette> findByName(String name) {
        return springDataRepository.findById(name).map(this::toDomain);
    }

    @Override
    public ThemePalette save(ThemePalette themePalette) {
        ThemePaletteJpaEntity entity = new ThemePaletteJpaEntity(themePalette.getName(), themePalette.getAccentColor(),
                themePalette.getDeepColor(), themePalette.getSoftColor(), themePalette.getDisplayOrder());
        return toDomain(springDataRepository.save(entity));
    }

    private ThemePalette toDomain(ThemePaletteJpaEntity entity) {
        return new ThemePalette(entity.getName(), entity.getAccentColor(), entity.getDeepColor(), entity.getSoftColor(),
                entity.getDisplayOrder());
    }
}
