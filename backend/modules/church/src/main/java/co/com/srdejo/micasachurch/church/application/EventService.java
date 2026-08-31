package co.com.srdejo.micasachurch.church.application;

import co.com.srdejo.micasachurch.church.domain.Event;
import co.com.srdejo.micasachurch.church.domain.EventRepository;
import co.com.srdejo.micasachurch.platform.webcommon.NotFoundException;

import java.util.List;
import java.util.UUID;

public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> listPublished() {
        return eventRepository.findAllPublishedOrdered();
    }

    public List<Event> listAll() {
        return eventRepository.findAllOrdered();
    }

    public Event create(String day, String month, String title, String detail, boolean published, int displayOrder) {
        return eventRepository.save(Event.create(day, month, title, detail, published, displayOrder));
    }

    public Event update(UUID id, String day, String month, String title, String detail, boolean published, int displayOrder) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new NotFoundException("event.not_found"));
        event.update(day, month, title, detail, published, displayOrder);
        return eventRepository.save(event);
    }

    public void delete(UUID id) {
        eventRepository.findById(id).orElseThrow(() -> new NotFoundException("event.not_found"));
        eventRepository.deleteById(id);
    }
}
