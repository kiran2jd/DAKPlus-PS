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

## Monitoring

### Health Checks
- Auth Service: http://localhost:8081/actuator/health
- Assessment Service: http://localhost:8082/actuator/health
- Scoring Service: http://localhost:8083/actuator/health

### Eureka Dashboard
View all registered services at http://localhost:8761
