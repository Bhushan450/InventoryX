package com.societybulk.bulk;

import com.societybulk.bulk.dto.BulkDemandResponse;
import com.societybulk.bulk.dto.BulkPurchaseRequest;
import com.societybulk.bulk.dto.BulkPurchaseResponse;
import com.societybulk.bulk.dto.SavingsResponse;
import com.societybulk.order.OrderItemRepository;
import com.societybulk.product.Product;
import com.societybulk.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkPurchaseService {

    private final OrderItemRepository orderItemRepository;
    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final ProductRepository productRepository;

    public List<BulkDemandResponse> getBulkDemand() {
        List<Object[]> rows = orderItemRepository.findBulkDemand();
        List<BulkDemandResponse> responses = new ArrayList<>();

        for (Object[] row : rows) {
            Long productId = (Long) row[0];
            String productName = (String) row[1];
            String unit = (String) row[2];
            Number qtyNumber = (Number) row[3];
            BigDecimal totalQuantity = qtyNumber != null
                    ? new BigDecimal(qtyNumber.toString())
                    : BigDecimal.ZERO;
            BigDecimal retailPrice = (BigDecimal) row[4];
            BigDecimal wholesalePrice = (BigDecimal) row[5];

            BigDecimal estimatedRetailCost = retailPrice.multiply(totalQuantity);
            BigDecimal estimatedWholesaleCost = wholesalePrice.multiply(totalQuantity);

            responses.add(BulkDemandResponse.builder()
                    .productId(productId)
                    .productName(productName)
                    .unit(unit)
                    .totalQuantity(totalQuantity)
                    .retailPrice(retailPrice)
                    .wholesalePrice(wholesalePrice)
                    .estimatedRetailCost(estimatedRetailCost)
                    .estimatedWholesaleCost(estimatedWholesaleCost)
                    .build());
        }

        return responses;
    }

    public SavingsResponse getSavings() {
        List<BulkDemandResponse> demandList = getBulkDemand();
        List<SavingsResponse.ProductSavingsItem> savingsItems = new ArrayList<>();

        BigDecimal totalRetailCost = BigDecimal.ZERO;
        BigDecimal totalWholesaleCost = BigDecimal.ZERO;
        BigDecimal totalSavings = BigDecimal.ZERO;

        for (BulkDemandResponse item : demandList) {
            BigDecimal diff = item.getRetailPrice().subtract(item.getWholesalePrice());
            BigDecimal itemSavings = diff.multiply(item.getTotalQuantity());

            totalRetailCost = totalRetailCost.add(item.getEstimatedRetailCost());
            totalWholesaleCost = totalWholesaleCost.add(item.getEstimatedWholesaleCost());
            totalSavings = totalSavings.add(itemSavings);

            savingsItems.add(SavingsResponse.ProductSavingsItem.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .unit(item.getUnit())
                    .totalQuantity(item.getTotalQuantity())
                    .retailPrice(item.getRetailPrice())
                    .wholesalePrice(item.getWholesalePrice())
                    .totalSavings(itemSavings)
                    .build());
        }

        return SavingsResponse.builder()
                .totalRetailCost(totalRetailCost)
                .totalWholesaleCost(totalWholesaleCost)
                .totalSavings(totalSavings)
                .items(savingsItems)
                .build();
    }

    @Transactional
    public BulkPurchaseResponse recordBulkPurchase(BulkPurchaseRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        BigDecimal totalCost = request.getTotalQuantity().multiply(request.getWholesalePrice());

        BulkPurchase purchase = BulkPurchase.builder()
                .product(product)
                .totalQuantity(request.getTotalQuantity())
                .wholesalePrice(request.getWholesalePrice())
                .totalCost(totalCost)
                .purchaseStatus(PurchaseStatus.PLANNED)
                .build();

        BulkPurchase saved = bulkPurchaseRepository.save(purchase);
        return BulkPurchaseResponse.fromEntity(saved);
    }

    public List<BulkPurchaseResponse> getAllBulkPurchases() {
        return bulkPurchaseRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(BulkPurchaseResponse::fromEntity)
                .toList();
    }

    @Transactional
    public BulkPurchaseResponse updatePurchaseStatus(Long id, String statusStr) {
        BulkPurchase purchase = bulkPurchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bulk purchase not found with id: " + id));

        PurchaseStatus newStatus;
        try {
            newStatus = PurchaseStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid purchase status: " + statusStr);
        }

        purchase.setPurchaseStatus(newStatus);
        BulkPurchase updated = bulkPurchaseRepository.save(purchase);
        return BulkPurchaseResponse.fromEntity(updated);
    }
}
