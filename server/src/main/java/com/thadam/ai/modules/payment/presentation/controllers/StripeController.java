package com.thadam.ai.modules.payment.presentation.controllers;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.thadam.ai.common.enums.SubscriptionPlan;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.modules.payment.core.application.services.StripeService;
import com.thadam.ai.modules.payment.core.domain.entities.ProcessedWebhook;
import com.thadam.ai.modules.payment.infrastructure.repositories.ProcessedWebhookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeService stripeService;
    private final UserRepository userRepository;
    private final LedgerService ledgerService;
    private final ProcessedWebhookRepository processedWebhookRepository;

    @Value("${stripe.webhook.secret:}")
    private String endpointSecret;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            org.springframework.security.core.Authentication authentication,
            @RequestBody Map<String, String> request) {
        try {
            if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String productType = request.get("productType");
            String url = stripeService.createCheckoutSession(user, productType);
            
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            log.error("Failed to create checkout session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cancel-subscription")
    public ResponseEntity<Map<String, String>> cancelSubscription(
            org.springframework.security.core.Authentication authentication) {
        try {
            if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            stripeService.cancelSubscription(user);
            
            return ResponseEntity.ok(Map.of("message", "Subscription cancelled successfully"));
        } catch (Exception e) {
            log.error("Failed to cancel subscription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        Event event = null;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Stripe signature verification failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("");
        }

        if (processedWebhookRepository.existsById(event.getId())) {
            log.info("Webhook event {} already processed. Ignoring.", event.getId());
            return ResponseEntity.ok("");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                try {
                    stripeObject = dataObjectDeserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.error("Failed to deserialize unsafe session", e);
                }
            }
            
            if (stripeObject instanceof Session session) {
                log.info("Parsed Session! Metadata: {}", session.getMetadata());
                String userIdStr = session.getMetadata() != null ? session.getMetadata().get("userId") : null;
                String productType = session.getMetadata() != null ? session.getMetadata().get("productType") : null;
                
                log.info("Extracted userId: {}, productType: {}", userIdStr, productType);
                
                if (userIdStr != null && productType != null) {
                    Long userId = Long.parseLong(userIdStr);
                    Optional<User> optionalUser = userRepository.findById(userId);
                    
                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        
                        if ("premium".equals(productType)) {
                            user.setPlan(SubscriptionPlan.PREMIUM);
                            if (session.getSubscription() != null) {
                                user.setStripeSubscriptionId(session.getSubscription());
                            }
                            userRepository.save(user);
                            log.info("User {} upgraded to PREMIUM", userId);
                        } else if ("coins_100".equals(productType)) {
                            ledgerService.addTransaction(user, new CoinTransactionRequest(
                                100, TransactionType.PURCHASED, "Bought 100 Coins", "COIN_PURCHASE", null
                            ));
                            log.info("User {} purchased 100 coins", userId);
                        } else if ("coins_500".equals(productType)) {
                            ledgerService.addTransaction(user, new CoinTransactionRequest(
                                500, TransactionType.PURCHASED, "Bought 500 Coins", "COIN_PURCHASE", null
                            ));
                            log.info("User {} purchased 500 coins", userId);
                        }
                    }
                }
            }
        } else if ("customer.subscription.deleted".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                try {
                    stripeObject = dataObjectDeserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.error("Failed to deserialize unsafe subscription", e);
                }
            }
            
            if (stripeObject instanceof Subscription subscription) {
                userRepository.findByStripeSubscriptionId(subscription.getId()).ifPresent(user -> {
                    user.setPlan(SubscriptionPlan.FREE);
                    user.setStripeSubscriptionId(null);
                    userRepository.save(user);
                    log.info("User {} subscription deleted, downgraded to FREE", user.getId());
                });
            }
        }
        
        processedWebhookRepository.save(new ProcessedWebhook(event.getId(), java.time.LocalDateTime.now()));
        
        return ResponseEntity.ok("");
    }
}
