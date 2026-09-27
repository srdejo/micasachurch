package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.PrayerRequest;
import co.com.srdejo.micasachurch.church.domain.PrayerRequestRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

public class PrayerRequestService {

    private static final Pattern NAME = Pattern.compile("^[\\p{L} ]{1,80}$");
    private static final Pattern PHONE = Pattern.compile("^\\+?\\d{7,15}$");

    private final PrayerRequestRepository prayerRequestRepository;

    public PrayerRequestService(PrayerRequestRepository prayerRequestRepository) {
        this.prayerRequestRepository = prayerRequestRepository;
    }

    public PrayerRequest submit(String name, String phone, String message) {
        String cleanName = blankToNull(name);
        String cleanPhone = blankToNull(phone);
        String cleanMessage = blankToNull(message);
        if (cleanMessage == null) {
            throw new BusinessRuleException("prayer_request.message_required");
        }
        if (cleanName != null && !NAME.matcher(cleanName).matches()) {
            throw new BusinessRuleException("prayer_request.invalid_name");
        }
        if (cleanPhone != null && !PHONE.matcher(cleanPhone).matches()) {
            throw new BusinessRuleException("prayer_request.invalid_phone");
        }
        return prayerRequestRepository.save(PrayerRequest.create(cleanName, cleanPhone, cleanMessage));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
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
