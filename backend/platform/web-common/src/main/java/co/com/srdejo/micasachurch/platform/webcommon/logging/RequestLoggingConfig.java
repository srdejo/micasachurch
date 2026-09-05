package co.com.srdejo.micasachurch.platform.webcommon.logging;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class RequestLoggingConfig {

    /**
     * HIGHEST_PRECEDENCE lo deja por fuera de la cadena de Spring Security, que Boot registra en
     * -100. Por dentro no veria las peticiones rechazadas por autenticacion, que son justamente
     * las que hay que poder diagnosticar.
     */
    @Bean
    public FilterRegistrationBean<RequestLoggingFilter> requestLoggingFilter() {
        FilterRegistrationBean<RequestLoggingFilter> registration =
                new FilterRegistrationBean<>(new RequestLoggingFilter());
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
