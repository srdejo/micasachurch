package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.PrayerRequest;
import co.com.srdejo.micasachurch.church.domain.PrayerRequestRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class PrayerRequestService {

    private final PrayerRequestRepository prayerRequestRepository;

    public PrayerRequestService(PrayerRequestRepository prayerRequestRepository) {
        this.prayerRequestRepository = prayerRequestRepository;
    }

    public PrayerRequest submit(String name, String phone, String message) {
        return prayerRequestRepository.save(PrayerRequest.create(name, phone, message));
    }

    public List<PrayerRequest> listAll() {
        return prayerRequestRepository.findAllOrderByCreatedAtDesc();
    }

    public long countUnread() {
        return prayerRequestRepository.countUnread();
    }

    public PrayerRequest markRead(UUID id) {
        PrayerRequest prayerRequest = prayerRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("prayer_request.not_found"));
        prayerRequest.markRead();
        return prayerRequestRepository.save(prayerRequest);
    }
}
