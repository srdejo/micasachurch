package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.AdminUserService;
import co.com.srdejo.micasachurch.church.application.ChangePasswordUseCase;
import co.com.srdejo.micasachurch.church.application.EventService;
import co.com.srdejo.micasachurch.church.application.LinkEntryService;
import co.com.srdejo.micasachurch.church.application.LoginUseCase;
import co.com.srdejo.micasachurch.church.application.NetworkService;
import co.com.srdejo.micasachurch.church.application.PrayerRequestService;
import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.church.domain.EventRepository;
import co.com.srdejo.micasachurch.church.domain.LinkEntryRepository;
import co.com.srdejo.micasachurch.church.domain.NetworkRepository;
import co.com.srdejo.micasachurch.church.domain.PrayerRequestRepository;
import co.com.srdejo.micasachurch.church.domain.ServiceScheduleRepository;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ChurchConfig {

    @Bean
    public EventService eventService(EventRepository eventRepository) {
        return new EventService(eventRepository);
    }

    @Bean
    public NetworkService networkService(NetworkRepository networkRepository) {
        return new NetworkService(networkRepository);
    }

    @Bean
    public PrayerRequestService prayerRequestService(PrayerRequestRepository prayerRequestRepository) {
        return new PrayerRequestService(prayerRequestRepository);
    }

    @Bean
    public ServiceScheduleService serviceScheduleService(ServiceScheduleRepository serviceScheduleRepository) {
        return new ServiceScheduleService(serviceScheduleRepository);
    }

    @Bean
    public LinkEntryService linkEntryService(LinkEntryRepository linkEntryRepository) {
        return new LinkEntryService(linkEntryRepository);
    }

    @Bean
    public SiteSettingsService siteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        return new SiteSettingsService(siteSettingsRepository);
    }

    @Bean
    public LoginUseCase loginUseCase(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        return new LoginUseCase(adminUserRepository, passwordEncoder);
    }

    @Bean
    public ChangePasswordUseCase changePasswordUseCase(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        return new ChangePasswordUseCase(adminUserRepository, passwordEncoder);
    }

    @Bean
    public AdminUserService adminUserService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        return new AdminUserService(adminUserRepository, passwordEncoder);
    }
}
