package com.thadam.ai.modules.user.core.application.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.ConflictException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserResponse;
import com.thadam.ai.modules.user.core.application.dtos.PublicUserResponse;
import com.thadam.ai.modules.user.core.application.dtos.UpdateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.UserResponse;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoadmapRepository roadmapRepository;
    private final AuditService auditService;

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public CreateUserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .build();

        User savedUser = userRepository.save(user);

        String performedBy = MDC.get("userId");
        log.info("USER_CREATED userId={} email={} performedBy={} correlationId={}",
                savedUser.getId(), savedUser.getEmail(), performedBy, MDC.get("correlationId"));
        auditService.userCreated(savedUser.getId(), savedUser.getEmail(),
                performedBy != null ? performedBy : "system");

        return new CreateUserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail());
    }

    @Cacheable(value = "users", key = "#id")
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + id));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
    }

    @Cacheable(value = "users", key = "'all'")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()))
                .toList();
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserResponse updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + id));

        user.setName(req.name());
        user.setEmail(req.email());

        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole());
    }

    public List<PublicUserResponse> getPublicUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new PublicUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        roadmapRepository.countByUserId(user.getId())))
                .toList();
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + id));

        String performedBy = MDC.get("userId");
        log.info("USER_DELETED targetUserId={} email={} performedBy={} correlationId={}",
                id, user.getEmail(), performedBy, MDC.get("correlationId"));
        auditService.userDeleted(id, performedBy != null ? performedBy : "system");

        userRepository.delete(user);
    }
}
