package co.com.srdejo.micasachurch.church.domain;

import java.util.UUID;
import java.util.regex.Pattern;

public class SiteSettings {

    public static final String DEFAULT_PRIMARY_COLOR = "#f89e1b";
    public static final String DEFAULT_SECONDARY_COLOR = "#000000";
    public static final String DEFAULT_TERTIARY_COLOR = "#ffffff";

    private static final Pattern HEX_COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");

    private final UUID id;
    private boolean liveBannerVisible;
    private String primaryColor;
    private String secondaryColor;
    private String tertiaryColor;

    public SiteSettings(UUID id, boolean liveBannerVisible, String primaryColor, String secondaryColor, String tertiaryColor) {
        this.id = id;
        this.liveBannerVisible = liveBannerVisible;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.tertiaryColor = tertiaryColor;
    }

    public void changeLiveBannerVisible(boolean liveBannerVisible) {
        this.liveBannerVisible = liveBannerVisible;
    }

    public void changeColors(String primaryColor, String secondaryColor, String tertiaryColor) {
        this.primaryColor = normalize(primaryColor);
        this.secondaryColor = normalize(secondaryColor);
        this.tertiaryColor = normalize(tertiaryColor);
    }

    public static boolean isValidColor(String color) {
        return color != null && HEX_COLOR.matcher(color).matches();
    }

    private static String normalize(String color) {
        return color.toLowerCase();
    }

    public UUID getId() {
        return id;
    }

    public boolean isLiveBannerVisible() {
        return liveBannerVisible;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public String getTertiaryColor() {
        return tertiaryColor;
    }
}
