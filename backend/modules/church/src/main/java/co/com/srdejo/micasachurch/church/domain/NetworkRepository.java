package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NetworkRepository {

    Network save(Network network);

    Optional<Network> findById(UUID id);

    List<Network> findAll();
}
