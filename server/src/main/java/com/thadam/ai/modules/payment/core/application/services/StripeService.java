package com.thadam.ai.modules.payment.core.application.services;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public String createCheckoutSession(User user, String productType) throws StripeException {
        // productType: "premium" or "coins_100", "coins_500"
        
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(productType.equals("premium") ? SessionCreateParams.Mode.SUBSCRIPTION : SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/pro?success=true&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/pro?canceled=true")
                .putMetadata("userId", user.getId().toString())
                .putMetadata("productType", productType)
                .setCustomerEmail(user.getEmail());

        long amount = 0;
        String name = "";
        
        switch (productType) {
            case "premium":
                amount = 1000; // $10.00
                name = "Thadam AI Premium (Monthly)";
                break;
            case "coins_100":
                amount = 500; // $5.00
                name = "100 Thadam Coins";
                break;
            case "coins_500":
                amount = 2000; // $20.00
                name = "500 Thadam Coins";
                break;
            default:
                throw new IllegalArgumentException("Invalid product type");
        }

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amount)
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(name)
                                                .build()
                                )
                                .build()
                )
                .build();

        if (productType.equals("premium")) {
            // For subscriptions, we need a recurring price data
            lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amount)
                                .setRecurring(
                                        SessionCreateParams.LineItem.PriceData.Recurring.builder()
                                                .setInterval(SessionCreateParams.LineItem.PriceData.Recurring.Interval.MONTH)
                                                .build()
                                )
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(name)
                                                .build()
                                )
                                .build()
                )
                .build();
        }

        paramsBuilder.addLineItem(lineItem);

        Session session = Session.create(paramsBuilder.build());
        return session.getUrl();
    }
}
