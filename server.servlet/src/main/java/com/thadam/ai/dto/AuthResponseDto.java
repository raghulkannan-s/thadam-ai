package com.thadam.ai.dto;

public class AuthResponseDto {
    private UserDto user;

    public AuthResponseDto(UserDto user) {
        this.user = user;
    }

    public UserDto getUser() {
        return user;
    }
}
