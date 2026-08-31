package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.LinkEntry;
import co.com.srdejo.micasachurch.church.domain.LinkEntryRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class LinkEntryService {

    private final LinkEntryRepository linkEntryRepository;

    public LinkEntryService(LinkEntryRepository linkEntryRepository) {
        this.linkEntryRepository = linkEntryRepository;
    }

    public List<LinkEntry> listAll() {
        return linkEntryRepository.findAll();
    }

    public LinkEntry update(UUID id, String value) {
        LinkEntry linkEntry = linkEntryRepository.findById(id).orElseThrow(() -> new NotFoundException("link_entry.not_found"));
        linkEntry.update(value);
        return linkEntryRepository.save(linkEntry);
    }
}
