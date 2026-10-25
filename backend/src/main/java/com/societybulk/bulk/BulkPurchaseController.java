package com.societybulk.bulk;

import com.societybulk.bulk.dto.BulkDemandResponse;
import com.societybulk.bulk.dto.BulkPurchaseRequest;
import com.societybulk.bulk.dto.BulkPurchaseResponse;
import com.societybulk.bulk.dto.SavingsResponse;
import com.societybulk.common.ApiResponse;
import com.societybulk.order.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BulkPurchaseController {

    private final BulkPurchaseService bulkPurchaseService;

    @GetMapping("/api/admin/bulk-demand")
    public ResponseEntity<ApiResponse<List<BulkDemandResponse>>> getBulkDemand() {
        List<BulkDemandResponse> demand = bulkPurchaseService.getBulkDemand();
        return ResponseEntity.ok(ApiResponse.success(demand, "Bulk demand calculated successfully"));
    }

    @GetMapping("/api/admin/savings")
    public ResponseEntity<ApiResponse<SavingsResponse>> getSavings() {
        SavingsResponse savings = bulkPurchaseService.getSavings();
        return ResponseEntity.ok(ApiResponse.success(savings, "Estimated savings calculated successfully"));
    }

    @PostMapping("/api/admin/bulk-purchases")
    public ResponseEntity<ApiResponse<BulkPurchaseResponse>> createBulkPurchase(
            @Valid @RequestBody BulkPurchaseRequest request
    ) {
        BulkPurchaseResponse response = bulkPurchaseService.recordBulkPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bulk purchase recorded successfully"));
    }

    @GetMapping("/api/admin/bulk-purchases")
    public ResponseEntity<ApiResponse<List<BulkPurchaseResponse>>> getAllBulkPurchases() {
        List<BulkPurchaseResponse> purchases = bulkPurchaseService.getAllBulkPurchases();
        return ResponseEntity.ok(ApiResponse.success(purchases, "Bulk purchases retrieved successfully"));
    }

    @PatchMapping("/api/admin/bulk-purchases/{id}/status")
    public ResponseEntity<ApiResponse<BulkPurchaseResponse>> updatePurchaseStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        BulkPurchaseResponse response = bulkPurchaseService.updatePurchaseStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response, "Bulk purchase status updated successfully"));
    }
}
