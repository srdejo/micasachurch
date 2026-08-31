package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.SiteImage;
import co.com.srdejo.micasachurch.church.domain.SiteImageRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SiteImageRepositoryAdapter implements SiteImageRepository {

    private final SiteImageSpringDataRepository springDataRepository;

    public SiteImageRepositoryAdapter(SiteImageSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<SiteImage> findAll() {
        return springDataRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<SiteImage> findByKey(String key) {
        return springDataRepository.findByKey(key).map(this::toDomain);
    }

    @Override
    public SiteImage save(SiteImage siteImage) {
        SiteImageJpaEntity entity = new SiteImageJpaEntity(siteImage.getId(), siteImage.getKey(), siteImage.getFilename(),
                siteImage.getContentType(), siteImage.getUpdatedAt());
        return toDomain(springDataRepository.save(entity));
    }

    private SiteImage toDomain(SiteImageJpaEntity entity) {
        return new SiteImage(entity.getId(), entity.getKey(), entity.getFilename(), entity.getContentType(), entity.getUpdatedAt());
    }
}
