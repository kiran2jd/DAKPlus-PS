package com.mockanytime.paymentservice.controller;

import com.mockanytime.paymentservice.model.Purchase;
import com.mockanytime.paymentservice.repository.PurchaseRepository;
import com.mockanytime.paymentservice.service.RazorpayService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final PurchaseRepository purchaseRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        System.out.println("Received create-order request: " + request);
        try {
            if (request.get("amount") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }
            double amount = Double.parseDouble(request.get("amount").toString());
            String receipt = (String) request.getOrDefault("receipt", "txn_" + System.currentTimeMillis());
            String userId = (String) request.get("userId");
            String itemId = (String) request.getOrDefault("itemId", "SUBSCRIPTION_PRO");
            String itemType = (String) request.getOrDefault("itemType", "SUBSCRIPTION");

            System.out.println("Initiating order creation for amount: " + amount);
            String orderId = razorpayService.createOrder(amount, receipt);
            System.out.println("Order created successfully: " + orderId);

            // Create Purchase record
            Purchase purchase = new Purchase();
            purchase.setUserId(userId);
            purchase.setItemId(itemId);
            purchase.setItemType(itemType);
            purchase.setAmount(amount);
            purchase.setOrderId(orderId);
            purchase.setStatus("CREATED");
            purchaseRepository.save(purchase);

            return ResponseEntity.ok(Map.of("orderId", orderId, "amount", amount, "currency", "INR"));
        } catch (RazorpayException e) {
            System.err.println("RazorpayException during create-order: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected exception during create-order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("razorpay_order_id");
        String paymentId = request.get("razorpay_payment_id");
        String signature = request.get("razorpay_signature");
        String userId = request.get("userId");

        System.out.println("Verifying payment: orderId=" + orderId + ", paymentId=" + paymentId);

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (isValid) {
            
            // Update Purchase record
            Purchase purchase = purchaseRepository.findByOrderId(orderId).orElse(null);
            if (purchase != null) {
                purchase.setPaymentId(paymentId);
                purchase.setStatus("PAID");
                purchase.setUpdatedAt(LocalDateTime.now());
                purchaseRepository.save(purchase);
                
                // If ItemType is SUBSCRIPTION, update user role
                if ("SUBSCRIPTION".equals(purchase.getItemType())) {
                     try {
                        // Call Auth Service to update tier
                        RestTemplate restTemplate = new RestTemplate();
                        String authServiceUrl = "http://auth-service:8081/auth/internal/update-tier";
                        System.out.println("Calling auth-service to upgrade tier for user: " + userId);
                        restTemplate.put(authServiceUrl, Map.of("userId", userId, "tier", "PREMIUM"));
                        System.out.println("User tier upgraded to PREMIUM for userId: " + userId);
                    } catch (Exception e) {
                        System.err.println("Failed to update user tier automatically: " + e.getMessage());
                    }
                }
            }
            
            return ResponseEntity
                    .ok(Map.of("status", "success", "message", "Payment verified"));
        } else {
            // Update Purchase as Failed
             Purchase purchase = purchaseRepository.findByOrderId(orderId).orElse(null);
             if (purchase != null) {
                 purchase.setStatus("FAILED");
                 purchase.setUpdatedAt(LocalDateTime.now());
                 purchaseRepository.save(purchase);
             }
             
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "failure", "message", "Invalid payment signature"));
        }
    }
    
    @GetMapping("/check-access")
    public ResponseEntity<?> checkAccess(@RequestParam String userId, @RequestParam String itemId) {
        boolean hasAccess = purchaseRepository.existsByUserIdAndItemIdAndStatus(userId, itemId, "PAID");
        return ResponseEntity.ok(Map.of("hasAccess", hasAccess));
    }

    @GetMapping("/user-purchases")
    public ResponseEntity<?> getUserPurchases(@RequestParam String userId) {
        return ResponseEntity.ok(purchaseRepository.findByUserId(userId)
            .stream()
            .filter(p -> "PAID".equals(p.getStatus()))
            .toList());
    }
}
