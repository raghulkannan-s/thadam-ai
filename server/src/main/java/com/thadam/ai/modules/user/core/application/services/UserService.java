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
import com.thadam.ai.common.cloudinary.CloudinaryService;
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
    private final CloudinaryService cloudinaryService;

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
                savedUser.getPublicId(),
                savedUser.getName(),
                savedUser.getEmail());
    }

    @Cacheable(value = "users", key = "#publicId")
    public UserResponse getUserByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + publicId));

        return new UserResponse(
                user.getPublicId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getCoins(),
                user.getPlan());
    }

    @Cacheable(value = "users", key = "'all'")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getPublicId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getAvatarUrl(),
                        user.getCoins(),
                        user.getPlan()))
                .toList();
    }

    @Transactional
    @CacheEvict(value = "users", key = "#publicId")
    public UserResponse updateUser(String publicId, UpdateUserRequest req) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + publicId));

        user.setName(req.name());
        user.setEmail(req.email());
        if (req.avatarUrl() != null) {
            if (req.avatarUrl().startsWith("data:image")) {
                String secureUrl = cloudinaryService.uploadBase64Image(req.avatarUrl());
                if (secureUrl != null) {
                    user.setAvatarUrl(secureUrl);
                }
            } else {
                user.setAvatarUrl(req.avatarUrl());
            }
        }

        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getPublicId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getAvatarUrl(),
                updatedUser.getCoins(),
                updatedUser.getPlan());
    }

    public List<PublicUserResponse> getPublicUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new PublicUserResponse(
                        user.getPublicId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        roadmapRepository.countByUserId(user.getId()),
                        user.getAvatarUrl(),
                        user.getCoins(),
                        user.getVerificationScore() != null ? user.getVerificationScore() : 0))
                .toList();
    }

    @Cacheable(value = "users_public", key = "#publicId")
    public PublicUserResponse getPublicUserById(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + publicId));
        return new PublicUserResponse(
                user.getPublicId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                roadmapRepository.countByUserId(user.getId()),
                user.getAvatarUrl(),
                user.getCoins(),
                user.getVerificationScore() != null ? user.getVerificationScore() : 0);
    }

    @Transactional
    @CacheEvict(value = "users_public", key = "#publicId")
    public void verifyUser(String publicId, boolean isReal) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + publicId));
        int score = user.getVerificationScore() != null ? user.getVerificationScore() : 0;
        user.setVerificationScore(isReal ? score + 1 : score - 1);
        userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#publicId")
    public void deleteUser(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + publicId));

        String performedBy = MDC.get("userId");
        log.info("USER_DELETED targetUserPublicId={} email={} performedBy={} correlationId={}",
                publicId, user.getEmail(), performedBy, MDC.get("correlationId"));
        auditService.userDeleted(user.getId(), performedBy != null ? performedBy : "system");

        userRepository.delete(user);
    }
}
