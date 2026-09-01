package co.com.srdejo.micasachurch.church.infrastructure;

import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

class MailTemplateRenderer {

    String render(String templateClasspath, Map<String, String> variables) {
        String template = readTemplate(templateClasspath);
        StringBuilder result = new StringBuilder(template);
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() == null ? "" : entry.getValue();
            int index;
            while ((index = result.indexOf(placeholder)) != -1) {
                result.replace(index, index + placeholder.length(), value);
            }
        }
        return result.toString();
    }

    private String readTemplate(String classpath) {
        try {
            return StreamUtils.copyToString(new ClassPathResource(classpath).getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }
}
