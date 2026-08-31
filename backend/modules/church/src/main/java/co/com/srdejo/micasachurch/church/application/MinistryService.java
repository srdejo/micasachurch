package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.Ministry;
import co.com.srdejo.micasachurch.church.domain.MinistryRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class MinistryService {

    private final MinistryRepository ministryRepository;

    public MinistryService(MinistryRepository ministryRepository) {
        this.ministryRepository = ministryRepository;
    }

    public List<Ministry> listAll() {
        return ministryRepository.findAllOrdered();
    }

    public Ministry create(String name, String description, int displayOrder) {
        return ministryRepository.save(Ministry.create(name, description, displayOrder));
    }

    public Ministry update(UUID id, String name, String description, int displayOrder) {
        Ministry ministry = ministryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ministry.not_found"));
        ministry.update(name, description, displayOrder);
        return ministryRepository.save(ministry);
    }

    public void delete(UUID id) {
        ministryRepository.findById(id).orElseThrow(() -> new NotFoundException("ministry.not_found"));
        ministryRepository.deleteById(id);
    }
}
