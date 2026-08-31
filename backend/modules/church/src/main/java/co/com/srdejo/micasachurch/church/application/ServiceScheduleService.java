package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.ServiceSchedule;
import co.com.srdejo.micasachurch.church.domain.ServiceScheduleRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class ServiceScheduleService {

    private final ServiceScheduleRepository serviceScheduleRepository;

    public ServiceScheduleService(ServiceScheduleRepository serviceScheduleRepository) {
        this.serviceScheduleRepository = serviceScheduleRepository;
    }

    public List<ServiceSchedule> listAll() {
        return serviceScheduleRepository.findAll();
    }

    public ServiceSchedule update(UUID id, String time, String note, boolean streamed) {
        ServiceSchedule serviceSchedule = serviceScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
        serviceSchedule.update(time, note, streamed);
        return serviceScheduleRepository.save(serviceSchedule);
    }
}
