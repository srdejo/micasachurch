package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceScheduleRepository {

    ServiceSchedule save(ServiceSchedule serviceSchedule);

    Optional<ServiceSchedule> findById(UUID id);

    List<ServiceSchedule> findAll();
}
