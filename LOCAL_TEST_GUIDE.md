# DAKPlus Local Testing Guide (Messaging, Email, Payments)

Follow these steps to verify "productive" features in your local environment before cloud deployment.

## 1. Environment Preparation
Update your `backend/auth-service/.env` and `backend/payment-service/.env` (or the root `.env` if using Docker) with real keys:

| Feature | Variables to Set |
| :--- | :--- |
| **OTP SMS** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| **OTP Email** | `RESEND_API_KEY`, `SPRING_MAIL_USERNAME=onboarding@resend.dev` |
| **Payments** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_MODE=test` |

## 2. Testing OTP Reliability
1.  **Twilio Success**: Enter your phone number in the login. Check for SMS.
2.  **Failover Test**: Temporarily break your Twilio credentials. The system should automatically send the OTP via **MSG91** (verify in your MSG91 dashboard or server logs).
3.  **Resend Email**: Click "Resend OTP" and check your email inbox. Verify the sender dashboard at Resend.com.

## 3. Testing Automated Payments
1.  **Start Services**: Ensure `auth-service` and `payment-service` are running.
2.  **Trigger Payment**: In the student dashboard, attempt a "Pro Upgrade".
3.  **Payment Sandbox**: Use Razorpay "Test Mode" credentials.
4.  **Verification**: After payment, refresh your profile. Your tier should automatically show **PREMIUM**.
    - *Note*: If testing outside Docker, ensure `payment-service` can reach `auth-service` via `localhost:8081`.

## 4. Run Automated Unit Tests
Verify core stability with the included test suite:
```bash
cd backend/auth-service
./mvnw test -Dtest=OtpServiceTest
```

## 5. Security Check
- Try to take a screenshot on the mobile app during a test (it should be blocked).
- Attempt to login from a second device (the first session should be invalidated).
