package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.ServiceSchedule;
import co.com.srdejo.micasachurch.church.domain.ServiceScheduleRepository;
import co.com.srdejo.micasachurch.platform.webcommon.BusinessRuleException;
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

    public ServiceSchedule create(String day, String time, String note, boolean streamed, Integer durationMinutes) {
        int duration = durationMinutes != null ? durationMinutes : ServiceSchedule.DEFAULT_DURATION_MINUTES;
        validateDuration(duration);
        int nextOrder = serviceScheduleRepository.findAll().stream()
                .mapToInt(ServiceSchedule::getDisplayOrder)
                .max()
                .orElse(0) + 1;
        return serviceScheduleRepository.save(ServiceSchedule.create(day, time, note, streamed, nextOrder, duration));
    }

    /**
     * @param day dia del servicio. Si llega vacio se conserva el que ya tenia: el panel viejo
     *            enviaba solo hora, nota y transmision, y un despliegue a medias no deberia
     *            borrar el dia.
     * @param durationMinutes si llega null se conserva la que tenia, por la misma razon.
     */
    public ServiceSchedule update(UUID id, String day, String time, String note, boolean streamed, Integer durationMinutes) {
        ServiceSchedule serviceSchedule = serviceScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
        String dayToApply = (day == null || day.isBlank()) ? serviceSchedule.getDay() : day;
        int duration = durationMinutes != null ? durationMinutes : serviceSchedule.getDurationMinutes();
        validateDuration(duration);
        serviceSchedule.update(dayToApply, time, note, streamed, duration);
        return serviceScheduleRepository.save(serviceSchedule);
    }

    private static void validateDuration(int durationMinutes) {
        if (!ServiceSchedule.isValidDuration(durationMinutes)) {
            throw new BusinessRuleException("service_schedule.invalid_duration");
        }
    }

    public void delete(UUID id) {
        serviceScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("service_schedule.not_found"));
        serviceScheduleRepository.deleteById(id);
    }
}
