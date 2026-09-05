package co.com.srdejo.micasachurch.platform.webcommon.logging;

import org.slf4j.MDC;

/**
 * Contrato del contexto de log de una peticion. Existe para que los modulos que aportan datos
 * (seguridad, por ejemplo) no dependan de MDC ni de las claves como texto suelto.
 *
 * El ciclo de vida lo controla RequestLoggingFilter: el es el unico que limpia. Quien aporta un
 * dato no limpia, porque el filtro externo siempre ejecuta su finally y el hilo vuelve limpio al
 * pool aunque la cadena falle a mitad de camino.
 */
public final class LogContext {

    public static final String REQUEST_ID = "requestId";
    public static final String USER_ID = "userId";

    private LogContext() {
    }

    public static void putRequestId(String requestId) {
        MDC.put(REQUEST_ID, requestId);
    }

    public static void putUserId(String userId) {
        MDC.put(USER_ID, userId);
    }

    public static void clear() {
        MDC.clear();
    }
}
