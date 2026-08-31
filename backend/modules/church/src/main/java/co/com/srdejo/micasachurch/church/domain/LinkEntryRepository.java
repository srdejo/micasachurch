package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LinkEntryRepository {

    LinkEntry save(LinkEntry linkEntry);

    Optional<LinkEntry> findById(UUID id);

    List<LinkEntry> findAll();
}
