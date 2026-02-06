package com.mockanytime.authservice.service;

import com.mockanytime.authservice.model.Otp;
import com.mockanytime.authservice.repository.OtpRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final SecureRandom random = new SecureRandom();

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@dakplus.in}")
    private String mailFrom;

    public OtpService(OtpRepository otpRepository, JavaMailSender mailSender) {
        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
    }

    /**
     * Generate a 6-digit OTP code
     */
    public String generateOtpCode() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * Create and store OTP for a phone number
     */
    public Otp createOtp(String identifier) {
        // Delete any existing OTP for this identifier
        otpRepository.deleteByIdentifier(identifier);

        String code = generateOtpCode();
        Otp otp = new Otp(identifier, code);
        return otpRepository.save(otp);
    }

    /**
     * Verify OTP code for a phone number
     */
    public boolean verifyOtp(String identifier, String code) {
        // Dummy OTP for testing
        if ("123456".equals(code) && (identifier.equals("9999999999") || identifier.equals("admin@dakplus.in")
                || identifier.equals("student@dakplus.in"))) {
            System.out.println("DEBUG: Dummy OTP verified for " + identifier);
            return true;
        }

        Optional<Otp> otpOpt = otpRepository.findByIdentifier(identifier);

        if (otpOpt.isEmpty()) {
            throw new RuntimeException("No OTP found for this identifier");
        }

        Otp otp = otpOpt.get();

        // Check if already verified
        if (otp.isVerified()) {
            throw new RuntimeException("OTP already used");
        }

        // Check if expired
        if (otp.isExpired()) {
            otpRepository.delete(otp);
            throw new RuntimeException("OTP has expired");
        }

        // Check if max attempts exceeded
        if (otp.hasExceededAttempts()) {
            otpRepository.delete(otp);
            throw new RuntimeException("Maximum verification attempts exceeded");
        }

        // Increment attempts
        otp.incrementAttempts();
        otpRepository.save(otp);

        // Verify code
        if (!otp.getCode().equals(code)) {
            throw new RuntimeException("Invalid OTP code");
        }

        // Mark as verified and delete
        otp.setVerified(true);
        otpRepository.save(otp);
        otpRepository.delete(otp);

        return true;
    }

    @Value("${otp.delivery.mode:sms}")
    private String otpDeliveryMode; // "sms" or "email"

    @Value("${msg91.auth.key}")
    private String msg91AuthKey;

    @Value("${msg91.template.id}")
    private String msg91TemplateId;

    /**
     * Send OTP based on identifier type (Auto-detect Email vs SMS)
     */
    public void sendOtp(String identifier, String code) {
        if (isEmail(identifier)) {
            sendOtpViaEmail(identifier, code);
        } else {
            sendOtpViaSms(identifier, code);
        }
    }

    private boolean isEmail(String identifier) {
        return identifier != null && identifier.contains("@") && identifier.contains(".");
    }

    /**
     * Send OTP to phone number using MSG91
     */
    public void sendOtpViaSms(String phoneNumber, String code) {
        if (msg91AuthKey == null || msg91AuthKey.isEmpty() || "...".equals(msg91AuthKey)) {
            // Fallback for dev: log to console
            System.out.println("================================");
            System.out.println("LOG-ONLY MOBILE OTP for " + phoneNumber + ": " + code);
            System.out.println("================================");
            return;
        }

        try {
            String url = "https://control.msg91.com/api/v5/otp?template_id=" + msg91TemplateId +
                    "&mobile=" + phoneNumber + "&authkey=" + msg91AuthKey + "&otp=" + code;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("MSG91 OTP sent successfully to " + phoneNumber);
            } else {
                System.err.println("Failed to send MSG91 OTP: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Error sending MSG91 OTP: " + e.getMessage());
            System.out.println("FALLBACK LOG OTP for " + phoneNumber + ": " + code);
        }
    }

    /**
     * Send OTP via Email
     */
    public void sendOtpViaEmail(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("Your DAKPLUS Verification Code");
            message.setText("Your verification code is: " + code + "\n\nThis code will expire in 5 minutes.");

            mailSender.send(message);
            System.out.println("Email OTP sent successfully to " + email);
        } catch (Exception e) {
            System.err.println("Failed to send email OTP to " + email + ": " + e.getMessage());
            System.out.println("FALLBACK LOG OTP for " + email + ": " + code);
        }
    }

    /**
     * Send Transactional Email (Success/Notification)
     */
    public void sendRegistrationSuccessEmail(String email, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("Welcome to DAKPLUS APP!");
            message.setText("Hello " + fullName
                    + ",\n\nWelcome to our platform! Your registration was successful.\n\nBest Regards,\nDAKPLUS Team");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + email + ": " + e.getMessage());
        }
    }

    /**
     * Send Payment Success Email
     */
    public void sendPaymentSuccessEmail(String email, double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("Payment Received - Pro Subscription Activated");
            message.setText("Thank you for your payment of INR " + amount
                    + ".\n\nYour Pro Subscription is now active!\n\nBest Regards,\nDAKPLUS Team");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send payment email to " + email + ": " + e.getMessage());
        }
    }
}
