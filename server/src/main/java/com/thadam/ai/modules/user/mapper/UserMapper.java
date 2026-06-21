package com.thadam.ai.modules.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserResponse;
import com.thadam.ai.modules.user.core.application.dtos.UpdateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.UserResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "publicId", target = "id")
    UserResponse toUserResponse(User user);

    CreateUserResponse toCreateUserResponse(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    User toEntity(CreateUserRequest request);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    User toEntity(UpdateUserRequest request);
}
