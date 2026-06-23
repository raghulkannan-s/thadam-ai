package com.thadam.ai.modules.admin.core.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CoinAdjustmentRequest {
    
    @NotNull(message = "Amount is required")
    private Integer amount;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}
