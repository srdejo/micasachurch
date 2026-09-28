package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.HeroBanner;
import co.com.srdejo.micasachurch.church.domain.HeroBannerRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HeroBannerServiceTest {

    private HeroBannerService service;
    private HeroBanner banner;

    @BeforeEach
    void setUp() {
        service = new HeroBannerService(new InMemoryBanners());
        banner = service.create("Mi casa es tu casa");
    }

    @Test
    void newBannersStartInactive() {
        assertThat(banner.isActive()).isFalse();
        assertThat(service.listActive()).isEmpty();
    }

    @Test
    void rejectsUnsafeOrPlainHttpLinks() {
        for (String href : List.of("javascript:alert(1)", "http://example.com", "ftp://x", "horarios")) {
            assertThatThrownBy(() -> service.update(banner.getId(), null, "Título", null, "Ir", href, true))
                    .isInstanceOf(BusinessRuleException.class);
        }
    }

    @Test
    void acceptsAnchorsRoutesAndHttps() {
        for (String href : List.of("#horarios", "/devocional", "https://www.facebook.com/micasachurchocana", "")) {
            HeroBanner updated = service.update(banner.getId(), null, "Título", null, "Ir", href, true);
            assertThat(updated.isActive()).isTrue();
        }
    }

    @Test
    void titleIsRequired() {
        assertThatThrownBy(() -> service.update(banner.getId(), null, "  ", null, null, null, true))
                .isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> service.create(null)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void reorderFollowsGivenIds() {
        HeroBanner second = service.create("Segundo");
        service.reorder(List.of(second.getId(), banner.getId()));

        assertThat(service.listAll()).extracting(HeroBanner::getTitle).containsExactly("Segundo", "Mi casa es tu casa");
    }

    private static class InMemoryBanners implements HeroBannerRepository {
        private final List<HeroBanner> banners = new ArrayList<>();

        @Override
        public List<HeroBanner> findAll() {
            return banners.stream().sorted(Comparator.comparingInt(HeroBanner::getDisplayOrder)).toList();
        }

        @Override
        public Optional<HeroBanner> findById(UUID id) {
            return banners.stream().filter(b -> b.getId().equals(id)).findFirst();
        }

        @Override
        public HeroBanner save(HeroBanner heroBanner) {
            banners.removeIf(b -> b.getId().equals(heroBanner.getId()));
            banners.add(heroBanner);
            return heroBanner;
        }

        @Override
        public void deleteById(UUID id) {
            banners.removeIf(b -> b.getId().equals(id));
        }
    }
}
