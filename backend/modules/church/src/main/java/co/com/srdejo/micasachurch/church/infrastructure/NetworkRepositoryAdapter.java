package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.Network;
import co.com.srdejo.micasachurch.church.domain.NetworkRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class NetworkRepositoryAdapter implements NetworkRepository {

    private final NetworkSpringDataRepository springDataRepository;

    public NetworkRepositoryAdapter(NetworkSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Network save(Network network) {
        NetworkJpaEntity entity = new NetworkJpaEntity(network.getId(), network.getKey(), network.getName(),
                network.getDescription(), network.getLeadContact());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<Network> findById(UUID id) {
        return springDataRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Network> findAll() {
        return springDataRepository.findAll().stream().map(this::toDomain).toList();
    }

    private Network toDomain(NetworkJpaEntity entity) {
        return new Network(entity.getId(), entity.getKey(), entity.getName(), entity.getDescription(), entity.getLeadContact());
    }
}
