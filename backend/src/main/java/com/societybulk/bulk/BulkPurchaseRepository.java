package com.societybulk.bulk;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkPurchaseRepository extends JpaRepository<BulkPurchase, Long> {

    List<BulkPurchase> findAllByOrderByCreatedAtDesc();
}
