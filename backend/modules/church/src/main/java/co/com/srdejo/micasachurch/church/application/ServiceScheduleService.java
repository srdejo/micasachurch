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

    public ServiceSchedule create(String day, String time, String note, boolean streamed) {
        int nextOrder = serviceScheduleRepository.findAll().stream()
                .mapToInt(ServiceSchedule::getDisplayOrder)
                .max()
                .orElse(0) + 1;
        return serviceScheduleRepository.save(ServiceSchedule.create(day, time, note, streamed, nextOrder));
    }

    /**
     * @param day dia del servicio. Si llega vacio se conserva el que ya tenia: el panel viejo
     *            enviaba solo hora, nota y transmision, y un despliegue a medias no deberia
     *            borrar el dia.
     */
    public ServiceSchedule update(UUID id, String day, String time, String note, boolean streamed) {
        ServiceSchedule serviceSchedule = serviceScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
        String dayToApply = (day == null || day.isBlank()) ? serviceSchedule.getDay() : day;
        serviceSchedule.update(dayToApply, time, note, streamed);
        return serviceScheduleRepository.save(serviceSchedule);
    }

    public void delete(UUID id) {
        serviceScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
        serviceScheduleRepository.deleteById(id);
    }
}
