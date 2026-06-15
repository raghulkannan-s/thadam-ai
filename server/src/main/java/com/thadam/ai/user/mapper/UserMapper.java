package com.thadam.ai.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.thadam.ai.auth.entity.User;
import com.thadam.ai.user.dto.CreateUserRequest;
import com.thadam.ai.user.dto.CreateUserResponse;
import com.thadam.ai.user.dto.UpdateUserRequest;
import com.thadam.ai.user.dto.UserResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toUserResponse(User user);

    CreateUserResponse toCreateUserResponse(User user);

    User toEntity(CreateUserRequest request);

    User toEntity(UpdateUserRequest request);
}
