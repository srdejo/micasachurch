package co.com.srdejo.micasachurch.platform.webcommon;

import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Resolves an English message key (thrown by domain/application exceptions) to the
 * Spanish text in {@code messages.properties} — the only place allowed to know the
 * response language, at a fixed locale (no per-request negotiation needed yet).
 */
@Component
public class MessageResolver {

    private static final Locale RESPONSE_LOCALE = Locale.forLanguageTag("es");

    private final MessageSource messageSource;

    public MessageResolver(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public String resolve(String messageKey) {
        try {
            return messageSource.getMessage(messageKey, null, RESPONSE_LOCALE);
        } catch (NoSuchMessageException e) {
            return messageKey;
        }
    }
}
