package com.thadam.ai.admin.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.admin.dto.AdminUserResponse;
import com.thadam.ai.admin.dto.ChangeRoleRequest;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.repository.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "'admin-all'")
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#id")
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return toAdminResponse(user);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public AdminUserResponse changeUserRole(Long id, ChangeRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        var oldRole = user.getRole();
        user.setRole(request.role());
        User saved = userRepository.save(user);

        String performedBy = MDC.get("userId");
        log.info("ROLE_CHANGED targetUserId={} oldRole={} newRole={} performedBy={} correlationId={}",
                id, oldRole, request.role(), performedBy, MDC.get("correlationId"));
        auditService.roleChanged(id, oldRole, request.role(), performedBy != null ? performedBy : "system");

        return toAdminResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        String performedBy = MDC.get("userId");
        log.info("USER_DELETED targetUserId={} email={} performedBy={} correlationId={}",
                id, user.getEmail(), performedBy, MDC.get("correlationId"));
        auditService.userDeleted(id, performedBy != null ? performedBy : "system");

        userRepository.delete(user);
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                true);
    }
}
