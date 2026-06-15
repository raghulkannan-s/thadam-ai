package com.thadam.ai.auth.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class UserRegisteredListener {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredListener.class);

    @Async("domainEventExecutor")
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Processing registration for user {}: {} ({})", event.getUserId(), event.getName(), event.getEmail());
    }
}
