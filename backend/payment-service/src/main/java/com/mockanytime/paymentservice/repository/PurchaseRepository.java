package com.mockanytime.paymentservice.repository;

import com.mockanytime.paymentservice.model.Purchase;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface PurchaseRepository extends MongoRepository<Purchase, String> {
    Optional<Purchase> findByOrderId(String orderId);
    List<Purchase> findByUserId(String userId);
    boolean existsByUserIdAndItemIdAndStatus(String userId, String itemId, String status);
}
