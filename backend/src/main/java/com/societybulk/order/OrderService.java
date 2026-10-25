package com.societybulk.order;

import com.societybulk.auth.AuthService;
import com.societybulk.order.dto.CreateOrderRequest;
import com.societybulk.order.dto.OrderItemRequest;
import com.societybulk.order.dto.OrderResponse;
import com.societybulk.order.dto.UpdateStatusRequest;
import com.societybulk.product.Product;
import com.societybulk.product.ProductRepository;
import com.societybulk.user.Role;
import com.societybulk.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuthService authService;

    @Transactional
    public OrderResponse placeOrder(CreateOrderRequest request) {
        User currentUser = authService.getCurrentUser();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(currentUser)
                .totalAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            if (Boolean.FALSE.equals(product.getAvailable())) {
                throw new RuntimeException("Product '" + product.getName() + "' is currently unavailable");
            }

            BigDecimal unitPrice = product.getRetailPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.fromEntity(savedOrder);
    }

    public List<OrderResponse> getMyOrders() {
        User currentUser = authService.getCurrentUser();
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        User currentUser = authService.getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = order.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You do not have permission to view this order");
        }

        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + request.getStatus());
        }

        if (newStatus != OrderStatus.PENDING_PAYMENT
                && newStatus != OrderStatus.CANCELLED
                && order.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("An order must be paid before it can advance to " + newStatus);
        }

        order.setOrderStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(updatedOrder);
    }
}
