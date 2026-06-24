package com.thadam.ai.modules.payment.infrastructure.repositories;

import com.thadam.ai.modules.payment.core.domain.entities.ProcessedWebhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedWebhookRepository extends JpaRepository<ProcessedWebhook, String> {
}
