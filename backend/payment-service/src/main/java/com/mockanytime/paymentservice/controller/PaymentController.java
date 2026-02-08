package com.mockanytime.paymentservice.controller;

import com.mockanytime.paymentservice.service.RazorpayService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        System.out.println("Received create-order request: " + request);
        try {
            if (request.get("amount") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }
            double amount = Double.parseDouble(request.get("amount").toString());
            String receipt = (String) request.getOrDefault("receipt", "txn_" + System.currentTimeMillis());

            System.out.println("Initiating order creation for amount: " + amount);
            String orderId = razorpayService.createOrder(amount, receipt);
            System.out.println("Order created successfully: " + orderId);

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

        System.out.println("Verifying payment: orderId=" + orderId + ", paymentId=" + paymentId);

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (isValid) {
            String userId = request.get("userId");
            try {
                // Call Auth Service to update tier
                RestTemplate restTemplate = new RestTemplate();
                // Port 8081 is the actual port for auth-service in docker-compose
                // Note: removed '/api' as we are calling the service directly (internal)
                String authServiceUrl = "http://auth-service:8081/auth/internal/update-tier";

                System.out.println("Calling auth-service to upgrade tier for user: " + userId);
                restTemplate.put(authServiceUrl, Map.of("userId", userId, "tier", "PREMIUM"));
                System.out.println("User tier upgraded to PREMIUM for userId: " + userId);
            } catch (Exception e) {
                System.err.println("Failed to update user tier automatically: " + e.getMessage());
            }
            return ResponseEntity
                    .ok(Map.of("status", "success", "message", "Payment verified and tier upgrade triggered"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "failure", "message", "Invalid payment signature"));
        }
    }
}
