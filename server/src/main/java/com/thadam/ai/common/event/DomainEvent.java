package com.thadam.ai.common.event;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;

@Getter
public abstract class DomainEvent {

    private final String eventId;
    private final LocalDateTime occurredAt;

    protected DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.occurredAt = LocalDateTime.now();
    }

    protected DomainEvent(String eventId, LocalDateTime occurredAt) {
        this.eventId = eventId;
        this.occurredAt = occurredAt;
    }
}
