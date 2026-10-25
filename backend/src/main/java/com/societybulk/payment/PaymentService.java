package com.societybulk.payment;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.societybulk.auth.AuthService;
import com.societybulk.order.Order;
import com.societybulk.order.OrderRepository;
import com.societybulk.order.OrderStatus;
import com.societybulk.order.PaymentStatus;
import com.societybulk.payment.dto.PaymentResponse;
import com.societybulk.payment.dto.RazorpayVerificationRequest;
import com.societybulk.user.Role;
import com.societybulk.user.User;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import org.json.JSONException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String CURRENCY = "INR";

    private final OrderRepository orderRepository;
    private final AuthService authService;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Transactional
    public PaymentResponse createGatewayOrder(Long orderId) {
        User currentUser = authService.getCurrentUser();
        Order order = getOrderForResident(orderId, currentUser);

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order has already been paid");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is not awaiting payment");
        }

        RazorpayClient client = getRazorpayClient();
        String gatewayOrderId = order.getRazorpayOrderId();
        if (gatewayOrderId == null || gatewayOrderId.isBlank()) {
            try {
                JSONObject request = new JSONObject();
                request.put("amount", toPaise(order.getTotalAmount()));
                request.put("currency", CURRENCY);
                request.put("receipt", "societybulk_" + order.getId());

                com.razorpay.Order gatewayOrder = client.orders.create(request);
                gatewayOrderId = gatewayOrder.get("id");
                order.setRazorpayOrderId(gatewayOrderId);
                orderRepository.save(order);
            } catch (RazorpayException | ArithmeticException exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Could not create a Razorpay order. Check the payment configuration and try again.",
                        exception
                );
            }
        }

        return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getOrderStatus().name())
                .gatewayOrderId(gatewayOrderId)
                .keyId(keyId)
                .amount(toPaise(order.getTotalAmount()))
                .currency(CURRENCY)
                .message("Razorpay checkout is ready.")
                .build();
    }

    @Transactional
    public PaymentResponse verifyGatewayPayment(Long orderId, RazorpayVerificationRequest request) {
        User currentUser = authService.getCurrentUser();
        Order order = getOrderForResident(orderId, currentUser);

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return toResponse(order, "Payment has already been verified.");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is not awaiting payment");
        }
        if (order.getRazorpayOrderId() == null
                || !order.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay order does not match this SocietyBulk order");
        }

        RazorpayClient client = getRazorpayClient();
        try {
            JSONObject signatureData = new JSONObject();
            signatureData.put("razorpay_order_id", request.getRazorpayOrderId());
            signatureData.put("razorpay_payment_id", request.getRazorpayPaymentId());
            signatureData.put("razorpay_signature", request.getRazorpaySignature());

            if (!Utils.verifyPaymentSignature(signatureData, keySecret)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay payment signature is invalid");
            }

            com.razorpay.Payment gatewayPayment = client.payments.fetch(request.getRazorpayPaymentId());
            String paymentOrderId = gatewayPayment.get("order_id");
            String currency = gatewayPayment.get("currency");
            String status = gatewayPayment.get("status");
            Number amount = gatewayPayment.get("amount");

            if (!request.getRazorpayOrderId().equals(paymentOrderId)
                    || !CURRENCY.equals(currency)
                    || amount == null
                    || amount.longValue() != toPaise(order.getTotalAmount())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "The gateway payment does not match this order's amount and currency"
                );
            }

            if ("captured".equals(status)) {
                order.setRazorpayPaymentId(request.getRazorpayPaymentId());
                order.setPaymentStatus(PaymentStatus.SUCCESS);
                order.setOrderStatus(OrderStatus.PAID);
                orderRepository.save(order);
                return toResponse(order, "Payment captured and verified. Your order is now paid.");
            }

            if ("failed".equals(status)) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                orderRepository.save(order);
                return toResponse(order, "Razorpay reported that this payment failed. You can retry checkout.");
            }

            return toResponse(order, "Payment is not captured yet. The order remains unpaid.");
        } catch (RazorpayException | ArithmeticException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not verify the Razorpay payment. Please retry or contact the society coordinator.",
                    exception
            );
        }
    }

    public PaymentResponse getPaymentStatus(Long orderId) {
        User currentUser = authService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = order.getUser().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to view payment status for this order"
            );
        }

        return toResponse(order, "Current payment status is " + order.getPaymentStatus().name());
    }

    @Transactional
    public void processWebhook(String rawBody, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay webhook is not configured on the backend."
            );
        }
        if (!isValidWebhookSignature(rawBody, signature)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay webhook signature is invalid");
        }

        try {
            JSONObject event = new JSONObject(rawBody);
            if (!"payment.captured".equals(event.optString("event"))) {
                return;
            }

            JSONObject payment = event.getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");
            String gatewayOrderId = payment.getString("order_id");
            String gatewayPaymentId = payment.getString("id");
            String currency = payment.getString("currency");
            long amount = payment.getLong("amount");

            Order order = orderRepository.findByRazorpayOrderId(gatewayOrderId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "SocietyBulk order for this Razorpay payment was not found"
                    ));

            if (!CURRENCY.equals(currency) || amount != toPaise(order.getTotalAmount())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Captured Razorpay payment does not match the order amount and currency"
                );
            }

            if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
                if (!gatewayPaymentId.equals(order.getRazorpayPaymentId())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "A different payment has already been recorded for this order"
                    );
                }
                return;
            }

            order.setRazorpayPaymentId(gatewayPaymentId);
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT) {
                order.setOrderStatus(OrderStatus.PAID);
            }
            orderRepository.save(order);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (JSONException | ArithmeticException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Razorpay webhook payload is invalid",
                    exception
            );
        }
    }

    private boolean isValidWebhookSignature(String rawBody, String signature) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expectedSignature = hmac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            byte[] suppliedSignature = HexFormat.of().parseHex(signature);
            return MessageDigest.isEqual(expectedSignature, suppliedSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException | IllegalArgumentException exception) {
            return false;
        }
    }

    private Order getOrderForResident(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only pay for your own orders"
            );
        }
        return order;
    }

    private RazorpayClient getRazorpayClient() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend."
            );
        }
        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not initialize Razorpay. Check the backend payment configuration.",
                    exception
            );
        }
    }

    private long toPaise(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.UNNECESSARY)
                .movePointRight(2)
                .longValueExact();
    }

    private PaymentResponse toResponse(Order order, String message) {
        return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getOrderStatus().name())
                .gatewayOrderId(order.getRazorpayOrderId())
                .message(message)
                .build();
    }
}
