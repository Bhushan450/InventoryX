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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void placeOrderUsesDatabasePriceAndStoresPriceSnapshot() {
        User resident = User.builder()
                .id(4L)
                .name("Resident")
                .role(Role.RESIDENT)
                .build();
        Product product = Product.builder()
                .id(9L)
                .name("Rice")
                .unit("kg")
                .retailPrice(new BigDecimal("62.50"))
                .wholesalePrice(new BigDecimal("51.00"))
                .available(true)
                .build();

        when(authService.getCurrentUser()).thenReturn(resident);
        when(productRepository.findById(9L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.placeOrder(CreateOrderRequest.builder()
                .items(List.of(OrderItemRequest.builder().productId(9L).quantity(3).build()))
                .build());

        assertEquals(new BigDecimal("187.50"), response.getTotalAmount());
        assertEquals(new BigDecimal("62.50"), response.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("187.50"), response.getItems().get(0).getSubtotal());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("PENDING_PAYMENT", response.getOrderStatus());
    }

    @Test
    void placeOrderRejectsUnavailableProducts() {
        Product product = Product.builder()
                .id(9L)
                .name("Rice")
                .available(false)
                .build();
        when(authService.getCurrentUser()).thenReturn(User.builder().id(4L).build());
        when(productRepository.findById(9L)).thenReturn(Optional.of(product));

        assertThrows(RuntimeException.class, () -> orderService.placeOrder(CreateOrderRequest.builder()
                .items(List.of(OrderItemRequest.builder().productId(9L).quantity(1).build()))
                .build()));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void unpaidOrderCannotAdvanceToProcurement() {
        Order order = Order.builder()
                .id(12L)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .build();
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class, () -> orderService.updateOrderStatus(
                12L,
                UpdateStatusRequest.builder().status("ORDERED").build()
        ));

        verify(orderRepository, never()).save(any(Order.class));
    }
}
