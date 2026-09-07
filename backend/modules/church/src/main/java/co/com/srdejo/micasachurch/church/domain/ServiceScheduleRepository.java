package co.com.srdejo.micasachurch.church.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceScheduleRepository {

    ServiceSchedule save(ServiceSchedule serviceSchedule);

    Optional<ServiceSchedule> findById(UUID id);

    /** Ordenados por `displayOrder`: es el orden con el que se muestran en el sitio publico. */
    List<ServiceSchedule> findAll();

    void deleteById(UUID id);
}
