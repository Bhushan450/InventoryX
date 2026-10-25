package com.societybulk.dashboard;

import com.societybulk.auth.AuthService;
import com.societybulk.bulk.BulkPurchaseService;
import com.societybulk.dashboard.dto.AdminDashboardResponse;
import com.societybulk.dashboard.dto.ResidentDashboardResponse;
import com.societybulk.order.OrderItemRepository;
import com.societybulk.order.OrderRepository;
import com.societybulk.order.PaymentStatus;
import com.societybulk.order.dto.OrderResponse;
import com.societybulk.product.ProductRepository;
import com.societybulk.user.Role;
import com.societybulk.user.User;
import com.societybulk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BulkPurchaseService bulkPurchaseService;
    private final AuthService authService;

    public AdminDashboardResponse getAdminDashboard() {
        long totalResidents = userRepository.countByRole(Role.RESIDENT);
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long paidOrders = orderRepository.countByPaymentStatus(PaymentStatus.SUCCESS);
        BigDecimal totalCollected = orderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.SUCCESS);
        if (totalCollected == null) {
            totalCollected = BigDecimal.ZERO;
        }
        BigDecimal estimatedSavings = bulkPurchaseService.getSavings().getTotalSavings();
        if (estimatedSavings == null) {
            estimatedSavings = BigDecimal.ZERO;
        }

        return AdminDashboardResponse.builder()
                .totalResidents(totalResidents)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .paidOrders(paidOrders)
                .totalCollected(totalCollected)
                .estimatedSavings(estimatedSavings)
                .build();
    }

    public ResidentDashboardResponse getResidentDashboard() {
        User currentUser = authService.getCurrentUser();

        List<OrderResponse> recentOrders = orderRepository
                .findTop5ByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();

        long pendingPayments = orderRepository.countByUserIdAndPaymentStatus(
                currentUser.getId(),
                PaymentStatus.PENDING
        );

        BigDecimal totalSpent = orderRepository.sumTotalAmountByUserIdAndPaymentStatus(
                currentUser.getId(),
                PaymentStatus.SUCCESS
        );
        if (totalSpent == null) {
            totalSpent = BigDecimal.ZERO;
        }

        List<Object[]> userItems = orderItemRepository.findUserPurchasedItemsForSavings(currentUser.getId());
        BigDecimal estimatedSavings = BigDecimal.ZERO;
        for (Object[] row : userItems) {
            Number qtyNumber = (Number) row[3];
            BigDecimal qty = qtyNumber != null ? new BigDecimal(qtyNumber.toString()) : BigDecimal.ZERO;
            BigDecimal retail = (BigDecimal) row[4];
            BigDecimal wholesale = (BigDecimal) row[5];
            BigDecimal diff = retail.subtract(wholesale);
            estimatedSavings = estimatedSavings.add(diff.multiply(qty));
        }

        return ResidentDashboardResponse.builder()
                .recentOrders(recentOrders)
                .pendingPayments(pendingPayments)
                .totalSpent(totalSpent)
                .estimatedSavings(estimatedSavings)
                .build();
    }
}
