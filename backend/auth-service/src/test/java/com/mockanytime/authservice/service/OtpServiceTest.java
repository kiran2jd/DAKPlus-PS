package com.mockanytime.authservice.service;

import com.mockanytime.authservice.model.Otp;
import com.mockanytime.authservice.repository.OtpRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;

    @InjectMocks
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateOtp() {
        String identifier = "9999999999";
        Otp otp = new Otp(identifier, "123456");

        when(otpRepository.save(any(Otp.class))).thenReturn(otp);

        Otp result = otpService.createOtp(identifier);

        assertNotNull(result);
        assertEquals(identifier, result.getIdentifier());
        assertEquals(6, result.getCode().length());
        verify(otpRepository).deleteByIdentifier(identifier);
        verify(otpRepository).save(any(Otp.class));
    }

    @Test
    void testVerifyOtp_Success() {
        String identifier = "9999999999";
        String code = "123456";
        Otp otp = new Otp(identifier, code);

        when(otpRepository.findByIdentifier(identifier)).thenReturn(Optional.of(otp));

        boolean result = otpService.verifyOtp(identifier, code);

        assertTrue(result);
        verify(otpRepository).delete(otp);
    }

    @Test
    void testVerifyOtp_InvalidCode() {
        String identifier = "9999999999";
        String code = "123456";
        Otp otp = new Otp(identifier, code);

        when(otpRepository.findByIdentifier(identifier)).thenReturn(Optional.of(otp));

        assertThrows(RuntimeException.class, () -> otpService.verifyOtp(identifier, "654321"));
        verify(otpRepository, atLeastOnce()).save(otp); // To increment attempts
    }

    @Test
    void testVerifyOtp_Expired() {
        // Test logic for expiration can be added here
    }
}
