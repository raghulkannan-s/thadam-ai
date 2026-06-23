package com.thadam.ai.modules.payment.presentation.controllers;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.thadam.ai.common.enums.SubscriptionPlan;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.modules.payment.core.application.services.StripeService;
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

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = dataObjectDeserializer.getObject().orElse(null);
            
            if (stripeObject instanceof Session session) {
                String userIdStr = session.getMetadata().get("userId");
                String productType = session.getMetadata().get("productType");
                
                if (userIdStr != null && productType != null) {
                    Long userId = Long.parseLong(userIdStr);
                    Optional<User> optionalUser = userRepository.findById(userId);
                    
                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        
                        if ("premium".equals(productType)) {
                            user.setPlan(SubscriptionPlan.PREMIUM);
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
        }
        
        return ResponseEntity.ok("");
    }
}
