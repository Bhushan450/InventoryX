package com.societybulk.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long orderId;
    private String paymentStatus;
    private String orderStatus;
    private String gatewayOrderId;
    private String keyId;
    private Long amount;
    private String currency;
    private String message;
}
