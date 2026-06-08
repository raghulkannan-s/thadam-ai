package com.thadam.ai.dto;

public class UserDto {
    private long id;
    private String email;
    private String displayName;
    private String role;

    public UserDto(long id, String email, String displayName, String role) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
    }

    public long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getRole() {
        return role;
    }
}
