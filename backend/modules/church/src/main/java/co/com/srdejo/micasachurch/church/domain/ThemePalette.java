package co.com.srdejo.micasachurch.church.domain;

import java.util.Locale;
import java.util.regex.Pattern;

public class ThemePalette {

    public static final String DEFAULT_THEME = "Naranja";

    private static final Pattern HEX_COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");

    private final String name;
    private String accentColor;
    private String deepColor;
    private String softColor;
    private final int displayOrder;

    public ThemePalette(String name, String accentColor, String deepColor, String softColor, int displayOrder) {
        this.name = name;
        this.accentColor = accentColor;
        this.deepColor = deepColor;
        this.softColor = softColor;
        this.displayOrder = displayOrder;
    }

    public static boolean isValidColor(String color) {
        return color != null && HEX_COLOR.matcher(color).matches();
    }

    /** Null keeps the current value; callers validate with {@link #isValidColor} first. */
    public void changeColors(String accentColor, String deepColor, String softColor) {
        if (accentColor != null) {
            this.accentColor = normalize(accentColor);
        }
        if (deepColor != null) {
            this.deepColor = normalize(deepColor);
        }
        if (softColor != null) {
            this.softColor = normalize(softColor);
        }
    }

    private static String normalize(String color) {
        return color.toLowerCase(Locale.ROOT);
    }

    public String getName() {
        return name;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public String getDeepColor() {
        return deepColor;
    }

    public String getSoftColor() {
        return softColor;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
