package com.thadam.ai.dto;


public record CreateUserResponse(
    Long id,
    String name,
    String email
){}