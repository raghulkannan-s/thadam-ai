package com.thadam.ai.common.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import com.thadam.ai.common.enums.Role;

@Service
public class AuditService {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT");

    public void userCreated(Long userId, String email, String performedBy) {
        auditLog.info("USER_CREATED userId={} email={} performedBy={} correlationId={}",
                userId, email, performedBy, MDC.get("correlationId"));
    }

    public void userUpdated(Long userId, String performedBy) {
        auditLog.info("USER_UPDATED userId={} performedBy={} correlationId={}",
                userId, performedBy, MDC.get("correlationId"));
    }

    public void userDeleted(Long userId, String performedBy) {
        auditLog.info("USER_DELETED userId={} performedBy={} correlationId={}",
                userId, performedBy, MDC.get("correlationId"));
    }

    public void roleChanged(Long userId, Role oldRole, Role newRole, String performedBy) {
        auditLog.info("ROLE_CHANGED userId={} oldRole={} newRole={} performedBy={} correlationId={}",
                userId, oldRole, newRole, performedBy, MDC.get("correlationId"));
    }

    public void roadmapCreated(Long roadmapId, String title, Long userId) {
        auditLog.info("ROADMAP_CREATED roadmapId={} title={} userId={} correlationId={}",
                roadmapId, title, userId, MDC.get("correlationId"));
    }

    public void roadmapDeleted(Long roadmapId, Long userId) {
        auditLog.info("ROADMAP_DELETED roadmapId={} userId={} correlationId={}",
                roadmapId, userId, MDC.get("correlationId"));
    }

    public void coinTransaction(Long transactionId, Long userId, Long amount, String type) {
        auditLog.info("COIN_TRANSACTION transactionId={} userId={} amount={} type={} correlationId={}",
                transactionId, userId, amount, type, MDC.get("correlationId"));
    }

    public void communityAction(String action, Long roadmapId, Long userId) {
        auditLog.info("COMMUNITY_ACTION action={} roadmapId={} userId={} correlationId={}",
                action, roadmapId, userId, MDC.get("correlationId"));
    }

    public void userRegistered(Long userId, String email) {
        auditLog.info("USER_REGISTERED userId={} email={} correlationId={}",
                userId, email, MDC.get("correlationId"));
    }

    public void oAuthLogin(Long userId, String email) {
        auditLog.info("OAUTH_LOGIN userId={} email={} correlationId={}",
                userId, email, MDC.get("correlationId"));
    }

    public void tokenRefresh(Long userId) {
        auditLog.info("TOKEN_REFRESH userId={} correlationId={}",
                userId, MDC.get("correlationId"));
    }
}
