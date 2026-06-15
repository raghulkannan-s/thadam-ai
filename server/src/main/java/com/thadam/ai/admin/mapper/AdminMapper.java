package com.thadam.ai.admin.mapper;

import org.mapstruct.Mapper;

import com.thadam.ai.admin.dto.AdminUserResponse;
import com.thadam.ai.auth.entity.User;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    AdminUserResponse toAdminUserResponse(User user);
}
