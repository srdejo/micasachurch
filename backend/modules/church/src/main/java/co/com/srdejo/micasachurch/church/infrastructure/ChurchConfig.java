package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.AdminUserService;
import co.com.srdejo.micasachurch.church.application.ChangePasswordUseCase;
import co.com.srdejo.micasachurch.church.application.EventService;
import co.com.srdejo.micasachurch.church.application.ForgotPasswordUseCase;
import co.com.srdejo.micasachurch.church.application.LinkEntryService;
import co.com.srdejo.micasachurch.church.application.LoginUseCase;
import co.com.srdejo.micasachurch.church.application.MinistryService;
import co.com.srdejo.micasachurch.church.application.NetworkService;
import co.com.srdejo.micasachurch.church.application.PasswordResetMailSender;
import co.com.srdejo.micasachurch.church.application.PrayerRequestService;
import co.com.srdejo.micasachurch.church.application.PublishService;
import co.com.srdejo.micasachurch.church.application.ResetPasswordUseCase;
import co.com.srdejo.micasachurch.church.application.ServiceScheduleService;
import co.com.srdejo.micasachurch.church.application.SiteContentService;
import co.com.srdejo.micasachurch.church.application.SiteImageService;
import co.com.srdejo.micasachurch.church.application.SiteSettingsService;
import co.com.srdejo.micasachurch.church.domain.AdminUserRepository;
import co.com.srdejo.micasachurch.church.domain.EventRepository;
import co.com.srdejo.micasachurch.church.domain.LinkEntryRepository;
import co.com.srdejo.micasachurch.church.domain.MinistryRepository;
import co.com.srdejo.micasachurch.church.domain.NetworkRepository;
import co.com.srdejo.micasachurch.church.domain.PasswordResetTokenRepository;
import co.com.srdejo.micasachurch.church.domain.PrayerRequestRepository;
import co.com.srdejo.micasachurch.church.domain.ServiceScheduleRepository;
import co.com.srdejo.micasachurch.church.domain.SiteContentRepository;
import co.com.srdejo.micasachurch.church.domain.SiteImageRepository;
import co.com.srdejo.micasachurch.church.domain.SiteSettingsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

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
    public AdminUserService adminUserService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
                                              PasswordResetTokenRepository passwordResetTokenRepository,
                                              PasswordResetMailSender passwordResetMailSender,
                                              @Value("${app.admin-public-url}") String adminPublicUrl) {
        return new AdminUserService(adminUserRepository, passwordEncoder, passwordResetTokenRepository, passwordResetMailSender,
                adminPublicUrl);
    }

    @Bean
    public MinistryService ministryService(MinistryRepository ministryRepository) {
        return new MinistryService(ministryRepository);
    }

    @Bean
    public SiteContentService siteContentService(SiteContentRepository siteContentRepository) {
        return new SiteContentService(siteContentRepository);
    }

    @Bean
    public SiteImageService siteImageService(SiteImageRepository siteImageRepository) {
        return new SiteImageService(siteImageRepository);
    }

    @Bean
    public RestClient contactApiClient(@Value("${contact.api.base-url}") String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl).build();
    }

    @Bean
    public PasswordResetMailSender passwordResetMailSender(RestClient contactApiClient) {
        return new ContactApiPasswordResetMailSender(contactApiClient);
    }

    @Bean
    public ForgotPasswordUseCase forgotPasswordUseCase(AdminUserRepository adminUserRepository,
                                                         PasswordResetTokenRepository passwordResetTokenRepository,
                                                         PasswordResetMailSender passwordResetMailSender,
                                                         @Value("${app.admin-public-url}") String adminPublicUrl) {
        return new ForgotPasswordUseCase(adminUserRepository, passwordResetTokenRepository, passwordResetMailSender, adminPublicUrl);
    }

    @Bean
    public ResetPasswordUseCase resetPasswordUseCase(AdminUserRepository adminUserRepository,
                                                       PasswordResetTokenRepository passwordResetTokenRepository,
                                                       PasswordEncoder passwordEncoder) {
        return new ResetPasswordUseCase(adminUserRepository, passwordResetTokenRepository, passwordEncoder);
    }

    @Bean
    public PublishService publishService(EventService eventService, SiteContentService siteContentService,
                                          MinistryService ministryService) {
        return new PublishService(eventService, siteContentService, ministryService);
    }
}
