package com.societybulk.user;

import com.societybulk.common.ApiResponse;
import com.societybulk.user.dto.ResidentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/residents")
@RequiredArgsConstructor
public class ResidentController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResidentResponse>>> getResidents() {
        List<ResidentResponse> residents = userRepository.findByRoleOrderByCreatedAtDesc(Role.RESIDENT)
                .stream()
                .map(ResidentResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(residents, "Residents retrieved successfully"));
    }
}
