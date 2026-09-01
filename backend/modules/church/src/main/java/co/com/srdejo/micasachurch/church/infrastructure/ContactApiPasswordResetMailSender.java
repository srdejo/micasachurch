package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.application.PasswordResetMailSender;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Sends the account emails through the shared {@code contact} microservice
 * ({@code contact/src/server.js}, `POST /api/send`) instead of talking SMTP directly — same pattern
 * used by consulting's ContactApiDiagnosticoNotifier. That endpoint is restricted to loopback callers,
 * so this only works when both services run on the same host (true in prod).
 */
public class ContactApiPasswordResetMailSender implements PasswordResetMailSender {

    private final RestClient contactApiClient;
    private final MailTemplateRenderer templateRenderer = new MailTemplateRenderer();

    public ContactApiPasswordResetMailSender(RestClient contactApiClient) {
        this.contactApiClient = contactApiClient;
    }

    @Override
    public void sendResetLink(String toEmail, String resetLink) {
        String html = templateRenderer.render("mail-templates/reset-password.html", Map.of("link", resetLink));
        send(toEmail, "Restablece tu contraseña del panel", html);
    }

    @Override
    public void sendInviteLink(String toEmail, String username, String invitedBy, String inviteLink) {
        String html = templateRenderer.render("mail-templates/invite-admin.html",
                Map.of("link", inviteLink, "username", username, "inviter", invitedBy));
        send(toEmail, "Te invitaron a administrar la página", html);
    }

    private void send(String toEmail, String subject, String html) {
        try {
            contactApiClient.post()
                    .uri("/api/send")
                    .body(new SendRequest(toEmail, subject, html))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            throw new BusinessRuleException("contact.email_delivery_failed");
        }
    }

    private record SendRequest(String to, String subject, String html) {
    }
}
