package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MinistryRepository {

    Ministry save(Ministry ministry);

    Optional<Ministry> findById(UUID id);

    List<Ministry> findAllOrdered();

    void deleteById(UUID id);
}
