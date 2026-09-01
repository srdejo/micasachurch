package co.com.srdejo.micasachurch.church.infrastructure;

import co.com.srdejo.micasachurch.church.domain.PasswordResetToken;
import co.com.srdejo.micasachurch.church.domain.PasswordResetTokenRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepository {

    private final PasswordResetTokenSpringDataRepository springDataRepository;

    public PasswordResetTokenRepositoryAdapter(PasswordResetTokenSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public PasswordResetToken save(PasswordResetToken token) {
        PasswordResetTokenJpaEntity entity = new PasswordResetTokenJpaEntity(token.getId(), token.getAdminUserId(), token.getToken(),
                token.getExpiresAt(), token.isUsed());
        return toDomain(springDataRepository.save(entity));
    }

    @Override
    public Optional<PasswordResetToken> findByToken(String token) {
        return springDataRepository.findByToken(token).map(this::toDomain);
    }

    private PasswordResetToken toDomain(PasswordResetTokenJpaEntity entity) {
        return new PasswordResetToken(entity.getId(), entity.getAdminUserId(), entity.getToken(), entity.getExpiresAt(), entity.isUsed());
    }
}
