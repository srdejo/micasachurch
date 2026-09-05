package co.com.srdejo.micasachurch.platform.security;

import co.com.srdejo.micasachurch.platform.webcommon.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

/**
 * Sin esto Spring Security respondia 403 tambien cuando faltaba el token: al no haber httpBasic
 * ni formLogin registrados, su entry point por defecto es Http403ForbiddenEntryPoint. El front no
 * podia distinguir "sesion vencida" (debe ir a /login) de "no tiene permiso", y la respuesta salia
 * ademas sin cuerpo, fuera del contrato ApiResponse del resto de la API.
 */
public class SecurityErrorResponder implements AuthenticationEntryPoint, AccessDeniedHandler {

    private static final Logger log = LoggerFactory.getLogger(SecurityErrorResponder.class);

    private final ObjectMapper objectMapper;

    public SecurityErrorResponder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        log.warn("Sin autenticar en {} {}: {}", request.getMethod(), request.getRequestURI(),
                authException.getMessage());
        write(response, HttpStatus.UNAUTHORIZED, "Credenciales ausentes o invalidas");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                        AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Acceso denegado en {} {}: {}", request.getMethod(), request.getRequestURI(),
                accessDeniedException.getMessage());
        write(response, HttpStatus.FORBIDDEN, "No tiene permisos para esta operacion");
    }

    private void write(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ApiResponse.error(message));
    }
}
