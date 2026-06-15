package com.thadam.ai.auth.mapper;

import org.mapstruct.Mapper;

import com.thadam.ai.auth.dto.RegisterResponse;
import com.thadam.ai.auth.entity.User;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    RegisterResponse toRegisterResponse(User user);
}
