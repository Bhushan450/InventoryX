package com.societybulk.bulk.dto;

import com.societybulk.bulk.BulkPurchase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkPurchaseResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String unit;
    private BigDecimal totalQuantity;
    private BigDecimal wholesalePrice;
    private BigDecimal totalCost;
    private String purchaseStatus;
    private LocalDateTime createdAt;

    public static BulkPurchaseResponse fromEntity(BulkPurchase purchase) {
        return BulkPurchaseResponse.builder()
                .id(purchase.getId())
                .productId(purchase.getProduct() != null ? purchase.getProduct().getId() : null)
                .productName(purchase.getProduct() != null ? purchase.getProduct().getName() : null)
                .unit(purchase.getProduct() != null ? purchase.getProduct().getUnit() : null)
                .totalQuantity(purchase.getTotalQuantity())
                .wholesalePrice(purchase.getWholesalePrice())
                .totalCost(purchase.getTotalCost())
                .purchaseStatus(purchase.getPurchaseStatus() != null ? purchase.getPurchaseStatus().name() : null)
                .createdAt(purchase.getCreatedAt())
                .build();
    }
}
