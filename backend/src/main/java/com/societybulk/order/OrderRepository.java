package com.societybulk.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByPaymentStatus(PaymentStatus status);

    long countByOrderStatus(OrderStatus status);

    List<Order> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    java.util.Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    long countByUserIdAndPaymentStatus(Long userId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :status")
    BigDecimal sumTotalAmountByPaymentStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.paymentStatus = :status")
    BigDecimal sumTotalAmountByUserIdAndPaymentStatus(@Param("userId") Long userId, @Param("status") PaymentStatus status);
}
