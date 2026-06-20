package com.thadam.ai.modules.auth.mapper;

import org.mapstruct.Mapper;

import com.thadam.ai.modules.auth.core.application.dtos.RegisterResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    RegisterResponse toRegisterResponse(User user);
}
