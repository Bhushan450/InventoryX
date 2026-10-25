package com.societybulk.bulk.dto;

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
public class SavingsResponse {

    private BigDecimal totalRetailCost;
    private BigDecimal totalWholesaleCost;
    private BigDecimal totalSavings;
    private List<ProductSavingsItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductSavingsItem {
        private Long productId;
        private String productName;
        private String unit;
        private BigDecimal totalQuantity;
        private BigDecimal retailPrice;
        private BigDecimal wholesalePrice;
        private BigDecimal totalSavings;
    }
}
