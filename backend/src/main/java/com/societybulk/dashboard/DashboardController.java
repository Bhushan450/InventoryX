package com.societybulk.dashboard;

import com.societybulk.common.ApiResponse;
import com.societybulk.dashboard.dto.AdminDashboardResponse;
import com.societybulk.dashboard.dto.ResidentDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/api/admin/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(response, "Admin dashboard stats retrieved successfully"));
    }

    @GetMapping("/api/resident/dashboard")
    public ResponseEntity<ApiResponse<ResidentDashboardResponse>> getResidentDashboard() {
        ResidentDashboardResponse response = dashboardService.getResidentDashboard();
        return ResponseEntity.ok(ApiResponse.success(response, "Resident dashboard stats retrieved successfully"));
    }
}
