package com.thadam.ai.modules.payment.core.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "processed_webhooks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedWebhook {

    @Id
    @Column(name = "event_id")
    private String eventId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
