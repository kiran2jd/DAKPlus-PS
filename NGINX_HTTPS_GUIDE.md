# Nginx HTTPS/SSL Configuration Guide for dakplus.in

Secure your production environment by using Nginx as a reverse proxy with Let's Encrypt SSL certificates.

## 1. Install Nginx and Certbot
Run these commands on your Ubuntu/Debian VPS:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 2. Nginx Server Configuration
Create a new configuration file: `/etc/nginx/sites-available/dakplus`

```nginx
server {
    listen 80;
    server_name dakplus.in www.dakplus.in api.dakplus.in;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name dakplus.in www.dakplus.in;

    # SSL configuration handled by Certbot later
    
    location / {
        proxy_pass http://localhost:3000; # Frontend Docker container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name api.dakplus.in;

    location / {
        proxy_pass http://localhost:8080; # API Gateway Docker container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        add_header 'Access-Control-Allow-Origin' 'https://dakplus.in' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    }
}
```

## 3. Enable Configuration and Obtain SSL
```bash
# Link the config
sudo ln -s /etc/nginx/sites-available/dakplus /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Obtain SSL Certificates
sudo certbot --nginx -d dakplus.in -d www.dakplus.in -d api.dakplus.in
```

## 4. Auto-Renewal
Certbot automatically adds a timer, but you can test it with:
```bash
sudo certbot renew --dry-run
```
