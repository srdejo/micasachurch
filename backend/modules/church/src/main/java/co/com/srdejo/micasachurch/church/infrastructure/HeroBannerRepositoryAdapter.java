package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.HeroBanner;
import co.com.srdejo.micasachurch.church.domain.HeroBannerRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class HeroBannerRepositoryAdapter implements HeroBannerRepository {

    private final HeroBannerSpringDataRepository springDataRepository;

    public HeroBannerRepositoryAdapter(HeroBannerSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<HeroBanner> findAll() {
        return springDataRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<HeroBanner> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public HeroBanner save(HeroBanner heroBanner) {
        HeroBannerJpaEntity entity = new HeroBannerJpaEntity(heroBanner.getId(), heroBanner.getKicker(), heroBanner.getTitle(),
                heroBanner.getText(), heroBanner.getCtaLabel(), heroBanner.getCtaHref(), heroBanner.getImageKey(),
                heroBanner.isActive(), heroBanner.getDisplayOrder());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    private HeroBanner toDomain(HeroBannerJpaEntity entity) {
        return new HeroBanner(entity.getId(), entity.getKicker(), entity.getTitle(), entity.getText(), entity.getCtaLabel(),
                entity.getCtaHref(), entity.getImageKey(), entity.isActive(), entity.getDisplayOrder());
    }
}
