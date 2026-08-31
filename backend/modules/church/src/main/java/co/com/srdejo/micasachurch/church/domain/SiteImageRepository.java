package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;

public interface SiteImageRepository {

    List<SiteImage> findAll();

    Optional<SiteImage> findByKey(String key);

    SiteImage save(SiteImage siteImage);
}
