package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.LinkEntry;
import co.com.srdejo.micasachurch.church.domain.LinkEntryRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LinkEntryRepositoryAdapter implements LinkEntryRepository {

    private final LinkEntrySpringDataRepository springDataRepository;

    public LinkEntryRepositoryAdapter(LinkEntrySpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public LinkEntry save(LinkEntry linkEntry) {
        LinkEntryJpaEntity entity = new LinkEntryJpaEntity(linkEntry.getId(), linkEntry.getKey(), linkEntry.getLabel(),
                linkEntry.getValue());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<LinkEntry> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<LinkEntry> findAll() {
        return springDataRepository.findAll().stream().map(this::toDomain).toList();
    }

    private LinkEntry toDomain(LinkEntryJpaEntity entity) {
        return new LinkEntry(entity.getId(), entity.getKey(), entity.getLabel(), entity.getValue());
    }
}
