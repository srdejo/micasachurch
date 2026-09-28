package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HeroBannerSpringDataRepository extends JpaRepository<HeroBannerJpaEntity, UUID> {

    List<HeroBannerJpaEntity> findAllByOrderByDisplayOrderAsc();
}
