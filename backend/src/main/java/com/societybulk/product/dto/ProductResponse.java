package com.societybulk.product.dto;

import com.societybulk.product.Product;
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
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private String unit;
    private BigDecimal retailPrice;
    private BigDecimal wholesalePrice;
    private Boolean available;
    private LocalDateTime createdAt;

    public static ProductResponse fromEntity(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription() == null ? "" : product.getDescription())
                .category(product.getCategory())
                .unit(product.getUnit())
                .retailPrice(product.getRetailPrice())
                .wholesalePrice(product.getWholesalePrice())
                .available(product.getAvailable())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
