# MockAnytime - Production Deployment Guide

## Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Manual Deployment

### 1. Start MongoDB
```bash
mongod --dbpath /path/to/data
```

### 2. Start Services in Order
```bash
# Discovery Server (wait for startup)
cd discovery-server && mvn spring-boot:run

# Auth Service
cd auth-service && mvn spring-boot:run

# Assessment Service
cd assessment-service && mvn spring-boot:run

# Scoring Service
cd scoring-service && mvn spring-boot:run

# API Gateway
cd api-gateway && mvn spring-boot:run
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access Points
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761
- MongoDB: localhost:27017

## Environment Variables

### Production Configuration
Create `.env` file:
```
SPRING_DATA_MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mockanytime?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
API_BASE_URL=https://api.yourdomain.com/api
ALLOWED_ORIGINS=https://yourdomain.com
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-server:8761/eureka/
```

## Testing

### Create Test User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "role": "STUDENT",
    "password": "Test@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test@123"
  }'
```

## Local End-to-End Test Scenarios

Before moving to production, verify these critical paths locally:

### 1. New Student Onboarding
- [ ] **Signup**: Register a new user at `http://localhost:3000/signup`.
- [ ] **OTP**: Use the fixed OTP `123456` to log in.
- [ ] **Dashboard**: Confirm sample topics (Java, Python) and tests appear.
- [ ] **Syllabus**: Click "Syllabus" and verify the topic hierarchy view.
- [ ] **Take Test**: Start a sample test and submit results.

### 2. Instructor Workflow
- [ ] **Topic Management**: Go to "Manage Topics" and create a new Topic/Subtopic.
- [ ] **Manual Creation**: Create a test manually and link it to the new topic.
- [ ] **AI Extraction**: Upload a PDF/Word doc and verify questions are extracted correctly.
- [ ] **Test Management**: Verify your created tests appear in your "My Tests" dashboard.

### 3. Payment Flow (Sandboxed)
- [ ] **Upgrade**: Click "Upgrade to Pro" in the Student Dashboard.
- [ ] **Payment**: Complete the Razorpay checkout in "Test Mode".
- [ ] **Pro Status**: Verify the "PRO" badge appears and locked tests become accessible.

---

## Mobile App: Testing & APK
 
### 1. Manual Testing (Dummy Credentials)
For quick testing without backend logs, use these dummy credentials:
- **Test Mobile**: `9999999999`
- **Test Admin Email**: `admin@dakplus.in`
- **Test Student Email**: `student@dakplus.in`
- **Fixed OTP**: `123456`
- **Default Admin Password**: `admin123` (for password login)
 
### 2. Building APK for Android
To build a standalone APK for testing:
 
```bash
cd mobile
 
# 1. Install EAS CLI
npm install -g eas-cli
 
# 2. Login to Expo
eas login
 
# 3. Configure project (First time only)
eas build:configure
 
# 4. Build APK (Development/Testing)
eas build -p android --profile preview
```
*Note: This will upload your code to Expo's build servers and return a download link for the APK.*
 
### 3. Exposing Local Backend to APK (via ngrok)
Standalone APKs cannot connect to `localhost`. The most reliable way to test on a physical device is using **ngrok**:

1. **Install ngrok**: [Download here](https://ngrok.com/download).
2. **Start Tunnel**: Run this command while your backend is running:
   ```bash
   ngrok http 8080
   ```
3. **Copy Forwarding URL**: You will get a URL like `https://a1b2-c3d4.ngrok-free.app`.
4. **Update Backend CORS**: In your root `.env`, add the ngrok URL to `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=http://localhost:3000,https://a1b2-c3d4.ngrok-free.app
   ```
5. **Update Mobile API**: In `mobile/.env`, set the new URL:
   ```bash
   EXPO_PUBLIC_API_URL=https://a1b2-c3d4.ngrok-free.app/api
   ```
6. **Rebuild APK**: Run `eas build -p android --profile preview` again. This APK will now talk to your computer from anywhere!
 
### 3. Promoting a User to ADMIN
To test admin features, you can manually promote a registered user in MongoDB:
 
```javascript
// Connect to MongoDB and run:
use mockanytime;
db.users.updateOne(
  { email: "admin@dakplus.in" },
  { $set: { role: "ADMIN" } }
);
```
 
## Monitoring

### Health Checks
- Auth Service: http://localhost:8081/actuator/health
- Assessment Service: http://localhost:8082/actuator/health
- Scoring Service: http://localhost:8083/actuator/health

### Eureka Dashboard
View all registered services at http://localhost:8761

## Railway Production Deployment

DAKPlus supports seamless deployment to Railway using Spring profiles. The application automatically switches between:
- **Local mode**: Eureka service discovery (Docker Compose)
- **Railway mode**: Private networking with direct HTTP routing

### Quick Railway Deployment

1. **Create Railway Project** at [railway.app](https://railway.app)
2. **Deploy 5 services** from GitHub (one per microservice):
   - `auth-service`
   - `assessment-service`
   - `scoring-service`
   - `payment-service`
   - `api-gateway`

3. **Set environment variable** for each service:
   ```bash
   SPRING_PROFILES_ACTIVE=railway
   ```

4. **Configure service-specific variables** (MongoDB URI, API keys, etc.)

5. **Generate public domain** for `api-gateway` only

### Complete Railway Guide

For detailed step-by-step instructions, environment variables reference, troubleshooting, and architecture diagrams, see:

📖 **[Railway Deployment Guide](./railway-deployment-guide.md)**

The guide covers:
- Service-by-service deployment steps
- Complete environment variables reference
- Private networking configuration
- Troubleshooting connection timeouts
- Monitoring and logging
- Cost optimization tips

---

## Transitioning to Production

When you are ready to move from local development to a live production environment, follow these steps:

### 1. Production Checklist
- [ ] **Domains**: Set up your domain (e.g., `api.dakplus.in` and `app.dakplus.in`).
- [ ] **Infrastructure**: Deploy backend to Railway (see Railway Deployment Guide above).
- [ ] **SSL/HTTPS**: Ensure all endpoints are served over HTTPS (Railway provides this automatically).
- [ ] **Secrets**: Rotate all passwords and JWT secrets.
- [ ] **Live Payments**: Switch `RAZORPAY_MODE` to `live` and update keys.
- [ ] **Database**: Use a dedicated Production cluster on MongoDB Atlas.

### 2. Beta Testing Distribution
To get feedback from real users:
1. **Android (APK)**: Use `eas build -p android --profile preview` to generate a download link. Share this link with your testers.
2. **Web (Public Alpha)**: Deploy your frontend to Vercel and share the URL.
3. **Admin Setup**: Reach out to your first set of instructors/teachers and provide them with the `admin@dakplus.in` default credentials for initial setup.

---

## Monitoring & Safety
... (unchanged) ...
