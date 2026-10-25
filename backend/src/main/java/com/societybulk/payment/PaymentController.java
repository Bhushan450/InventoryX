package com.societybulk.payment;

import com.societybulk.common.ApiResponse;
import com.societybulk.payment.dto.PaymentResponse;
import com.societybulk.payment.dto.RazorpayVerificationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/orders/{id}/payment/order")
    public ResponseEntity<ApiResponse<PaymentResponse>> createGatewayOrder(
            @PathVariable Long id
    ) {
        PaymentResponse response = paymentService.createGatewayOrder(id);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @PostMapping("/api/orders/{id}/payment/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyGatewayPayment(
            @PathVariable Long id,
            @Valid @RequestBody RazorpayVerificationRequest request
    ) {
        PaymentResponse response = paymentService.verifyGatewayPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @GetMapping("/api/orders/{id}/payment-status")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPaymentStatus(id);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
