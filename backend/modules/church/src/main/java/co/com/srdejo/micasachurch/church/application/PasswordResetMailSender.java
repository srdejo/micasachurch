package co.com.srdejo.micasachurch.church.application;

public interface PasswordResetMailSender {

    void sendResetLink(String toEmail, String resetLink);

    void sendInviteLink(String toEmail, String username, String invitedBy, String inviteLink);
}
