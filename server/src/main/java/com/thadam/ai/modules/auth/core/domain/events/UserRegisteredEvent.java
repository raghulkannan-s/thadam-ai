package com.thadam.ai.modules.auth.core.domain.events;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.event.DomainEvent;

import lombok.Getter;

@Getter
public class UserRegisteredEvent extends DomainEvent {

    private final Long userId;
    private final String email;
    private final String name;

    public UserRegisteredEvent(User user) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
    }
}
