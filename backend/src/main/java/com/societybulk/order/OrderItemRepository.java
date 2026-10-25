package com.societybulk.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, oi.product.name, oi.product.unit, SUM(oi.quantity), oi.product.retailPrice, oi.product.wholesalePrice " +
           "FROM OrderItem oi " +
           "WHERE oi.order.paymentStatus = com.societybulk.order.PaymentStatus.SUCCESS " +
           "AND oi.order.orderStatus <> com.societybulk.order.OrderStatus.CANCELLED " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.unit, oi.product.retailPrice, oi.product.wholesalePrice")
    List<Object[]> findBulkDemand();

    @Query("SELECT oi.product.id, oi.product.name, oi.product.unit, SUM(oi.quantity), oi.product.retailPrice, oi.product.wholesalePrice " +
           "FROM OrderItem oi " +
           "WHERE oi.order.user.id = :userId " +
           "AND oi.order.paymentStatus = com.societybulk.order.PaymentStatus.SUCCESS " +
           "AND oi.order.orderStatus <> com.societybulk.order.OrderStatus.CANCELLED " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.unit, oi.product.retailPrice, oi.product.wholesalePrice")
    List<Object[]> findUserPurchasedItemsForSavings(@Param("userId") Long userId);
}
