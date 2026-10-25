package com.societybulk.bulk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkDemandResponse {

    private Long productId;
    private String productName;
    private String unit;
    private BigDecimal totalQuantity;
    private BigDecimal retailPrice;
    private BigDecimal wholesalePrice;
    private BigDecimal estimatedRetailCost;
    private BigDecimal estimatedWholesaleCost;
}
