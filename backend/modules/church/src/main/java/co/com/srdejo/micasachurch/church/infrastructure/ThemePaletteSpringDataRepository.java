package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThemePaletteSpringDataRepository extends JpaRepository<ThemePaletteJpaEntity, String> {

    List<ThemePaletteJpaEntity> findAllByOrderByDisplayOrderAsc();
}
