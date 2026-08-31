package co.com.srdejo.micasachurch.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "co.com.srdejo.micasachurch")
@EntityScan(basePackages = "co.com.srdejo.micasachurch")
@EnableJpaRepositories(basePackages = "co.com.srdejo.micasachurch")
public class MicasachurchApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicasachurchApplication.class, args);
    }
}
