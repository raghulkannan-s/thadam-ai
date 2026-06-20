package com.thadam.ai.modules.auth.core.application.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6-20 characters")
    String password

) {}
