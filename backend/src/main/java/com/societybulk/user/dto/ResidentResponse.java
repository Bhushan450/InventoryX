package com.societybulk.user.dto;

import com.societybulk.user.User;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ResidentResponse {

    Long id;
    String name;
    String email;
    String flatNumber;
    LocalDateTime createdAt;

    public static ResidentResponse fromEntity(User user) {
        return ResidentResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .flatNumber(user.getFlatNumber())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
