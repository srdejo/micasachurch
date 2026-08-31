package co.com.srdejo.micasachurch.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(@Value("${security.jwt.secret}") String secret,
                       @Value("${security.jwt.ttl-minutes:720}") long ttlMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    public String issue(JwtClaims claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(claims.adminId().toString())
                .claim("admin_id", claims.adminId().toString())
                .claim("username", claims.username())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    public JwtClaims parse(String token) {
        Claims body = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return new JwtClaims(
                UUID.fromString(body.get("admin_id", String.class)),
                body.get("username", String.class)
        );
    }
}
