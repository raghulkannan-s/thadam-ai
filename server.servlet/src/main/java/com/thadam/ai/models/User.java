package com.thadam.ai.models;

import java.time.Instant;

public class User {
    private long id;
    private String email;
    private String passwordHash;
    private String role;
    private Instant createdAt;
    private Instant updatedAt;

    public User(long id, String email, String passwordHash, String role, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
