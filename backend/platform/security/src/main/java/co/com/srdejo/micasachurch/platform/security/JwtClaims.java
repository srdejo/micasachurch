package co.com.srdejo.micasachurch.platform.security;

import java.util.UUID;

public record JwtClaims(UUID adminId, String username) {
}
