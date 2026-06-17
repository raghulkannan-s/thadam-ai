package com.thadam.ai.modules.admin.mapper;

import org.mapstruct.Mapper;

import com.thadam.ai.modules.admin.core.application.dtos.AdminUserResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;

@Mapper(componentModel = "spring")
public interface AdminMapper {
    AdminUserResponse toAdminUserResponse(User user);
}
