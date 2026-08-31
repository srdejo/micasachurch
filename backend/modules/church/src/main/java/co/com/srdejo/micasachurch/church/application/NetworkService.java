package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.Network;
import co.com.srdejo.micasachurch.church.domain.NetworkRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class NetworkService {

    private final NetworkRepository networkRepository;

    public NetworkService(NetworkRepository networkRepository) {
        this.networkRepository = networkRepository;
    }

    public List<Network> listAll() {
        return networkRepository.findAll();
    }

    public Network update(UUID id, String description, String leadContact) {
        Network network = networkRepository.findById(id).orElseThrow(() -> new NotFoundException("network.not_found"));
        network.update(description, leadContact);
        return networkRepository.save(network);
    }
}
