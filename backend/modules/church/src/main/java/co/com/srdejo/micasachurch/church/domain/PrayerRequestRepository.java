package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrayerRequestRepository {

    PrayerRequest save(PrayerRequest prayerRequest);

    Optional<PrayerRequest> findById(UUID id);

    List<PrayerRequest> findAllOrderByCreatedAtDesc();

    long countUnread();
}
