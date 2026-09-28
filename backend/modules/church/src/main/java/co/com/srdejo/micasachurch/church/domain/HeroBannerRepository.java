package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HeroBannerRepository {

    List<HeroBanner> findAll();

    Optional<HeroBanner> findById(UUID id);

    HeroBanner save(HeroBanner heroBanner);

    void deleteById(UUID id);
}
