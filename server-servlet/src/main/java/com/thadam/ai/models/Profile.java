package com.thadam.ai.models;

import java.time.Instant;
import java.time.LocalDate;

public class Profile {
    private long userId;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private LocalDate lastActivityDate;
    private Instant createdAt;
    private Instant updatedAt;

    public Profile(long userId, String displayName, String bio, String avatarUrl, LocalDate lastActivityDate, Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.displayName = displayName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.lastActivityDate = lastActivityDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public long getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getBio() {
        return bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public LocalDate getLastActivityDate() {
        return lastActivityDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
