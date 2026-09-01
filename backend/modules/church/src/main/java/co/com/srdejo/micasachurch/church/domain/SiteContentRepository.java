package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteContentRepository {

    List<SiteContent> findAll();

    Optional<SiteContent> findById(UUID id);

    List<SiteContent> findAllWithDraft();

    SiteContent save(SiteContent siteContent);
}
