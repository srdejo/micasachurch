package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.HeroBanner;
import co.com.srdejo.micasachurch.church.domain.HeroBannerRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class HeroBannerService {

    private final HeroBannerRepository heroBannerRepository;

    public HeroBannerService(HeroBannerRepository heroBannerRepository) {
        this.heroBannerRepository = heroBannerRepository;
    }

    public List<HeroBanner> listAll() {
        return heroBannerRepository.findAll();
    }

    public List<HeroBanner> listActive() {
        return heroBannerRepository.findAll().stream().filter(HeroBanner::isActive).toList();
    }

    /** New banners start inactive so an empty one never shows up on the public site while it is being filled in. */
    public HeroBanner create(String title) {
        if (!HeroBanner.isValidTitle(title)) {
            throw new BusinessRuleException("hero_banner.title_required");
        }
        int nextOrder = heroBannerRepository.findAll().stream().mapToInt(HeroBanner::getDisplayOrder).max().orElse(0) + 1;
        return heroBannerRepository.save(HeroBanner.create(title.trim(), nextOrder));
    }

    public HeroBanner update(UUID id, String kicker, String title, String text, String ctaLabel, String ctaHref, boolean active) {
        if (!HeroBanner.isValidTitle(title)) {
            throw new BusinessRuleException("hero_banner.title_required");
        }
        if (!HeroBanner.isValidHref(ctaHref)) {
            throw new BusinessRuleException("hero_banner.invalid_href");
        }
        HeroBanner heroBanner = find(id);
        heroBanner.update(kicker, title, text, ctaLabel, ctaHref, active);
        return heroBannerRepository.save(heroBanner);
    }

    public HeroBanner changeImage(UUID id, String imageKey) {
        HeroBanner heroBanner = find(id);
        heroBanner.changeImage(imageKey);
        return heroBannerRepository.save(heroBanner);
    }

    public void reorder(List<UUID> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            HeroBanner heroBanner = find(orderedIds.get(i));
            heroBanner.setDisplayOrder(i + 1);
            heroBannerRepository.save(heroBanner);
        }
    }

    /** Returns the deleted banner so the caller can clean up the image it owned. */
    public HeroBanner delete(UUID id) {
        HeroBanner heroBanner = find(id);
        heroBannerRepository.deleteById(id);
        return heroBanner;
    }

    public HeroBanner find(UUID id) {
        return heroBannerRepository.findById(id).orElseThrow(() -> new NotFoundException("hero_banner.not_found"));
    }
}
