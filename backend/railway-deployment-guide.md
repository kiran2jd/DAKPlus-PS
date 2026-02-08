# Railway Production Deployment Guide

## Overview

This guide explains how to deploy the DAKPlus microservices to Railway using Spring profiles for environment-specific configuration. The application supports two deployment modes:

- **Local Development**: Uses Docker Compose with Eureka service discovery
- **Railway Production**: Uses Railway's private networking with direct HTTP routing

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **MongoDB Atlas**: Create a production database cluster
3. **API Keys**: Gather all required API keys (MSG91, OpenAI, Razorpay)
4. **GitHub Repository**: Ensure your code is pushed to GitHub

## Railway Deployment Architecture

Railway deploys each microservice as a separate service within a single project. Services communicate via **Railway's private networking** using the pattern:

```
http://<service-name>.railway.internal:<port>
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                       │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ api-gateway  │─────▶│ auth-service │                │
│  │   :8080      │      │    :8081     │                │
│  └──────┬───────┘      └──────────────┘                │
│         │                                                │
│         ├──────────────▶┌──────────────┐                │
│         │               │  assessment  │                │
│         │               │    :8082     │                │
│         │               └──────────────┘                │
│         │                                                │
│         ├──────────────▶┌──────────────┐                │
│         │               │   scoring    │                │
│         │               │    :8083     │                │
│         │               └──────────────┘                │
│         │                                                │
│         └──────────────▶┌──────────────┐                │
│                         │   payment    │                │
│                         │    :8084     │                │
│                         └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  Public Internet
              (Only api-gateway exposed)
```

## Step-by-Step Deployment

### Step 1: Create Railway Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Empty Project"**
4. Name it: `dakplus-production`

### Step 2: Deploy Each Service

You'll deploy 5 services in this order:

#### 2.1 Auth Service

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. **Root Directory**: `/backend/auth-service`
4. **Service Name**: `auth-service` (CRITICAL: must match exactly)
5. Click **"Add Variables"** and add:

```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8081
SPRING_DATA_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mockanytime?retryWrites=true&w=majority
MSG91_AUTH_KEY=your_msg91_key
MSG91_TEMPLATE_ID=your_template_id
OTP_DELIVERY_MODE=sms
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
```

6. Click **"Deploy"**

#### 2.2 Assessment Service

1. Click **"+ New"** → **"GitHub Repo"**
2. **Root Directory**: `/backend/assessment-service`
3. **Service Name**: `assessment-service`
4. Add variables:

```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8082
SPRING_DATA_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mockanytime?retryWrites=true&w=majority
SPRING_AI_OPENAI_API_KEY=your_openai_key
```

5. Click **"Deploy"**

#### 2.3 Scoring Service

1. Click **"+ New"** → **"GitHub Repo"**
2. **Root Directory**: `/backend/scoring-service`
3. **Service Name**: `scoring-service`
4. Add variables:

```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8083
SPRING_DATA_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mockanytime?retryWrites=true&w=majority
SPRING_AI_OPENAI_API_KEY=your_openai_key
```

5. Click **"Deploy"**

#### 2.4 Payment Service

1. Click **"+ New"** → **"GitHub Repo"**
2. **Root Directory**: `/backend/payment-service`
3. **Service Name**: `payment-service`
4. Add variables:

```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8084
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_MODE=live
```

5. Click **"Deploy"**

#### 2.5 API Gateway (Deploy Last)

1. Click **"+ New"** → **"GitHub Repo"**
2. **Root Directory**: `/backend/api-gateway`
3. **Service Name**: `api-gateway`
4. Add variables:

```bash
SPRING_PROFILES_ACTIVE=railway
PORT=8080
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-frontend-domain.vercel.app
```

5. Click **"Deploy"**
6. After deployment, click **"Settings"** → **"Networking"**
7. Click **"Generate Domain"** to get a public URL (e.g., `api-gateway-production.up.railway.app`)

### Step 3: Verify Deployment

#### 3.1 Check Service Status

1. Go to your Railway project dashboard
2. Verify all 5 services show **"Active"** status
3. Click on each service → **"Logs"** to check for errors

#### 3.2 Test Health Endpoints

```bash
# Replace with your actual Railway API Gateway URL
export RAILWAY_URL="https://api-gateway-production.up.railway.app"

# Test API Gateway health
curl $RAILWAY_URL/actuator/health

# Expected response:
# {"status":"UP"}
```

#### 3.3 Test Service Communication

```bash
# Test OTP endpoint (verifies api-gateway → auth-service communication)
curl -X POST $RAILWAY_URL/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919999999999"}'

# Expected: 200 OK with success message
# If you get a timeout, check Railway logs for connection errors
```

## Environment Variables Reference

### All Services (Common)

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Activates Railway profile | `railway` |
| `SPRING_DATA_MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |

### API Gateway

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Service port (8080) |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins |

### Auth Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Service port (8081) |
| `MSG91_AUTH_KEY` | Yes | MSG91 API key for SMS |
| `MSG91_TEMPLATE_ID` | Yes | MSG91 template ID |
| `OTP_DELIVERY_MODE` | Yes | `sms` or `email` |
| `SPRING_MAIL_USERNAME` | If email OTP | Gmail address |
| `SPRING_MAIL_PASSWORD` | If email OTP | Gmail app password |

### Assessment Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Service port (8082) |
| `SPRING_AI_OPENAI_API_KEY` | Yes | OpenAI API key |

### Scoring Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Service port (8083) |
| `SPRING_AI_OPENAI_API_KEY` | Yes | OpenAI API key |

### Payment Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Service port (8084) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret |
| `RAZORPAY_MODE` | Yes | `test` or `live` |

## Troubleshooting

### Connection Timeout Errors

**Symptom**: `ConnectTimeoutException: connection timed out after 30000 ms`

**Causes & Solutions**:

1. **Service name mismatch**
   - Verify Railway service names exactly match: `auth-service`, `assessment-service`, etc.
   - Check `application-railway.yml` URIs use correct service names

2. **Profile not activated**
   - Verify `SPRING_PROFILES_ACTIVE=railway` is set in ALL services
   - Check Railway logs for "Active profiles: railway"

3. **Service not started**
   - Check if the target service is running (green status in Railway)
   - Review service logs for startup errors

### MongoDB Connection Issues

**Symptom**: `MongoTimeoutException` or `MongoSocketException`

**Solutions**:
1. Verify MongoDB Atlas allows connections from anywhere (`0.0.0.0/0`)
2. Check `SPRING_DATA_MONGODB_URI` is correctly formatted
3. Ensure MongoDB cluster is running and accessible

### CORS Errors

**Symptom**: Frontend gets CORS errors when calling API

**Solutions**:
1. Add your frontend domain to `ALLOWED_ORIGINS` in API Gateway
2. Format: `https://your-domain.com` (no trailing slash)
3. Multiple origins: `https://domain1.com,https://domain2.com`

### 404 Not Found Errors

**Symptom**: API endpoints return 404

**Solutions**:
1. Verify route paths in `application-railway.yml` match your controllers
2. Check service is registered and running
3. Test direct service URL (if exposed) to isolate gateway vs service issue

## Monitoring & Logs

### Viewing Logs

1. Go to Railway Dashboard → Select Service
2. Click **"Logs"** tab
3. Use filters to search for specific errors

### Key Log Indicators

**Successful Startup**:
```
Started ApiGatewayApplication in X seconds
Active profiles: railway
```

**Successful Service Communication**:
```
Mapped [POST /auth/send-otp] onto public ResponseEntity<?>...
```

**Connection Issues**:
```
ConnectTimeoutException: connection timed out
UnknownHostException: service-name.railway.internal
```

## Updating Your Deployment

### Code Changes

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update service logic"
git push origin main
```

Railway will detect the change and redeploy affected services.

### Environment Variable Changes

1. Go to Railway Dashboard → Select Service
2. Click **"Variables"** tab
3. Update or add variables
4. Service will automatically restart

### Manual Redeploy

1. Go to Railway Dashboard → Select Service
2. Click **"Deployments"** tab
3. Click **"⋮"** on latest deployment → **"Redeploy"**

## Cost Optimization

Railway offers $5 free credit per month. To optimize costs:

1. **Use Hobby Plan**: $5/month for unlimited usage
2. **Monitor Usage**: Check Railway dashboard for resource consumption
3. **Scale Down Dev Services**: Use Railway's sleep feature for non-production services
4. **Optimize Logs**: Reduce log verbosity in production

## Security Best Practices

1. **Rotate Secrets**: Change JWT secrets, API keys before production
2. **Use Railway Secrets**: Never commit secrets to Git
3. **Enable HTTPS**: Railway provides SSL automatically
4. **Restrict CORS**: Only allow your frontend domain
5. **Database Security**: Use strong MongoDB passwords, enable IP whitelisting

## Next Steps

1. **Deploy Frontend**: Deploy React frontend to Vercel/Netlify
2. **Update Frontend Config**: Point `VITE_API_URL` to Railway API Gateway URL
3. **Test End-to-End**: Verify complete user flows work
4. **Set Up Monitoring**: Consider adding Sentry or LogRocket
5. **Configure Custom Domain**: Add your own domain in Railway settings

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: Check GitHub issues or create new ones
