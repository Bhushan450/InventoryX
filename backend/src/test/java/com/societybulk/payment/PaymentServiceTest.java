package com.societybulk.payment;

import com.societybulk.auth.AuthService;
import com.societybulk.order.Order;
import com.societybulk.order.OrderRepository;
import com.societybulk.order.OrderStatus;
import com.societybulk.order.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    private static final String WEBHOOK_SECRET = "local-test-webhook-secret";

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void configureWebhookSecret() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", WEBHOOK_SECRET);
    }

    @Test
    void capturedWebhookMarksMatchingOrderPaid() throws Exception {
        Order order = pendingOrder();
        when(orderRepository.findByRazorpayOrderId("order_gateway_123")).thenReturn(Optional.of(order));

        String body = capturedPaymentWebhook("pay_gateway_123", 12500);
        paymentService.processWebhook(body, sign(body));

        assertEquals(PaymentStatus.SUCCESS, order.getPaymentStatus());
        assertEquals(OrderStatus.PAID, order.getOrderStatus());
        assertEquals("pay_gateway_123", order.getRazorpayPaymentId());
        verify(orderRepository).save(order);
    }

    @Test
    void invalidWebhookSignatureDoesNotUpdateOrder() {
        assertThrows(ResponseStatusException.class, () ->
                paymentService.processWebhook(capturedPaymentWebhook("pay_gateway_123", 12500), "invalid"));

        verify(orderRepository, never()).save(ArgumentMatchers.any(Order.class));
    }

    @Test
    void capturedWebhookRejectsAmountThatDoesNotMatchOrder() throws Exception {
        Order order = pendingOrder();
        when(orderRepository.findByRazorpayOrderId("order_gateway_123")).thenReturn(Optional.of(order));
        String body = capturedPaymentWebhook("pay_gateway_123", 12499);

        assertThrows(ResponseStatusException.class, () -> paymentService.processWebhook(body, sign(body)));

        assertEquals(PaymentStatus.PENDING, order.getPaymentStatus());
        verify(orderRepository, never()).save(ArgumentMatchers.any(Order.class));
    }

    private Order pendingOrder() {
        return Order.builder()
                .id(45L)
                .totalAmount(new BigDecimal("125.00"))
                .razorpayOrderId("order_gateway_123")
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .build();
    }

    private String capturedPaymentWebhook(String paymentId, long amount) {
        return """
                {
                  "event": "payment.captured",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "%s",
                        "order_id": "order_gateway_123",
                        "currency": "INR",
                        "amount": %d
                      }
                    }
                  }
                }
                """.formatted(paymentId, amount);
    }

    private String sign(String body) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(hmac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    }
}
