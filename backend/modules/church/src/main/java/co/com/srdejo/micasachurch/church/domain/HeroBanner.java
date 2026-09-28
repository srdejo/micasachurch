package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;
import java.util.regex.Pattern;

public class HeroBanner {

    /** Anchor on the page, route of the site or an external https URL; anything else (javascript:, http:) is refused. */
    private static final Pattern VALID_HREF = Pattern.compile("^(#[\\w-]+|/[\\w\\-/]*|https://\\S+)$");

    private final UUID id;
    private String kicker;
    private String title;
    private String text;
    private String ctaLabel;
    private String ctaHref;
    private String imageKey;
    private boolean active;
    private int displayOrder;

    public HeroBanner(UUID id, String kicker, String title, String text, String ctaLabel, String ctaHref, String imageKey,
                      boolean active, int displayOrder) {
        this.id = id;
        this.kicker = kicker;
        this.title = title;
        this.text = text;
        this.ctaLabel = ctaLabel;
        this.ctaHref = ctaHref;
        this.imageKey = imageKey;
        this.active = active;
        this.displayOrder = displayOrder;
    }

    public static HeroBanner create(String title, int displayOrder) {
        return new HeroBanner(UUID.randomUUID(), null, title, null, null, null, null, false, displayOrder);
    }

    public static boolean isValidTitle(String title) {
        return title != null && !title.isBlank();
    }

    public static boolean isValidHref(String href) {
        return href == null || href.isBlank() || VALID_HREF.matcher(href.trim()).matches();
    }

    public static String imageKeyFor(UUID id) {
        return "banner-" + id;
    }

    public void update(String kicker, String title, String text, String ctaLabel, String ctaHref, boolean active) {
        this.kicker = kicker;
        this.title = title.trim();
        this.text = text;
        this.ctaLabel = ctaLabel;
        this.ctaHref = ctaHref == null || ctaHref.isBlank() ? null : ctaHref.trim();
        this.active = active;
    }

    public void changeImage(String imageKey) {
        this.imageKey = imageKey;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public UUID getId() {
        return id;
    }

    public String getKicker() {
        return kicker;
    }

    public String getTitle() {
        return title;
    }

    public String getText() {
        return text;
    }

    public String getCtaLabel() {
        return ctaLabel;
    }

    public String getCtaHref() {
        return ctaHref;
    }

    public String getImageKey() {
        return imageKey;
    }

    public boolean isActive() {
        return active;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
