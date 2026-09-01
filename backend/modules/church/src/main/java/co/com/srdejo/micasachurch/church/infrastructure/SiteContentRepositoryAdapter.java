package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.SiteContent;
import co.com.srdejo.micasachurch.church.domain.SiteContentRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class SiteContentRepositoryAdapter implements SiteContentRepository {

    private final SiteContentSpringDataRepository springDataRepository;

    public SiteContentRepositoryAdapter(SiteContentSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<SiteContent> findAll() {
        return springDataRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<SiteContent> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<SiteContent> findAllWithDraft() {
        return springDataRepository.findByHasDraftTrue().stream().map(this::toDomain).toList();
    }

    @Override
    public SiteContent save(SiteContent siteContent) {
        SiteContentJpaEntity entity = new SiteContentJpaEntity(siteContent.getId(), siteContent.getKey(),
                siteContent.getLabel(), siteContent.getValue(), siteContent.getDraftValue(), siteContent.hasDraft());
        return toDomain(springDataRepository.save(entity));
    }

    private SiteContent toDomain(SiteContentJpaEntity entity) {
        return new SiteContent(entity.getId(), entity.getKey(), entity.getLabel(), entity.getValue(), entity.getDraftValue(),
                entity.isHasDraft());
    }
}
