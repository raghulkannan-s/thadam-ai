package com.thadam.ai.modules.admin.core.application.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.admin.core.application.dtos.AdminUserResponse;
import com.thadam.ai.modules.admin.core.application.dtos.ChangeRoleRequest;
import com.thadam.ai.modules.admin.core.application.dtos.CoinAdjustmentRequest;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.VoteRepository;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final LedgerService ledgerService;
    private final RoadmapRepository roadmapRepository;
    private final VoteRepository voteRepository;

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
    public AdminUserResponse getUserById(String id) {
        User user = userRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return toAdminResponse(user);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public AdminUserResponse changeUserRole(String id, ChangeRoleRequest request) {
        User user = userRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        var oldRole = user.getRole();
        user.setRole(request.role());
        User saved = userRepository.save(user);

        String performedBy = MDC.get("userId");
        log.info("ROLE_CHANGED targetUserId={} oldRole={} newRole={} performedBy={} correlationId={}",
                id, oldRole, request.role(), performedBy, MDC.get("correlationId"));
        auditService.roleChanged(user.getId(), oldRole, request.role(), performedBy != null ? performedBy : "system");

        return toAdminResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public AdminUserResponse blacklistUser(String id) {
        User user = userRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        String performedBy = MDC.get("userId");
        log.info("USER_BLACKLISTED targetUserId={} email={} performedBy={} correlationId={}",
                id, user.getEmail(), performedBy, MDC.get("correlationId"));
        auditService.userDeleted(user.getId(), performedBy != null ? performedBy : "system");

        user.setActive(false);
        userRepository.save(user);
        
        roadmapRepository.updateVisibilityByUserId(user.getId(), RoadmapVisibility.PRIVATE);
        
        return toAdminResponse(user);
    }

    @Transactional
    public void adjustUserCoins(String publicId, CoinAdjustmentRequest request) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + publicId));

        TransactionType type = TransactionType.ADMIN_ADJUSTMENT;
        String referenceType = "ADMIN_COIN_OVERRIDE";
        
        CoinTransactionRequest transactionRequest = new CoinTransactionRequest(
                request.getAmount(),
                type,
                request.getReason(),
                referenceType,
                null
        );

        ledgerService.addTransaction(user, transactionRequest);
        String performedBy = MDC.get("userId");
        log.info("ADMIN_COIN_ADJUSTMENT targetUserId={} amount={} reason={} performedBy={} correlationId={}",
                publicId, request.getAmount(), request.getReason(), performedBy, MDC.get("correlationId"));
    }

    private AdminUserResponse toAdminResponse(User user) {
        long coins = ledgerService.getBalance(user.getId()).balance();
        long roadmapCount = roadmapRepository.countByUserId(user.getId());
        long forkCount = roadmapRepository.countForksReceivedByUserId(user.getId());
        long upvotes = voteRepository.countByRoadmapUserIdAndVoteType(user.getId(), VoteType.UPVOTE);
        long downvotes = voteRepository.countByRoadmapUserIdAndVoteType(user.getId(), VoteType.DOWNVOTE);

        return new AdminUserResponse(
                user.getPublicId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                coins,
                roadmapCount,
                forkCount,
                upvotes,
                downvotes);
    }
}
