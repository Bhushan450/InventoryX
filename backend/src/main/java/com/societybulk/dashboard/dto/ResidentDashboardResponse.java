package com.societybulk.dashboard.dto;

import com.societybulk.order.dto.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentDashboardResponse {

    private List<OrderResponse> recentOrders;
    private long pendingPayments;
    private BigDecimal totalSpent;
    private BigDecimal estimatedSavings;
}
