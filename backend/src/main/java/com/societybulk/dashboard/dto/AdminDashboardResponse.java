package com.societybulk.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalResidents;
    private long totalProducts;
    private long totalOrders;
    private long paidOrders;
    private BigDecimal totalCollected;
    private BigDecimal estimatedSavings;
}
