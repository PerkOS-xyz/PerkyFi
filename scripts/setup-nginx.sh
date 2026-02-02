#!/bin/bash
# PerkyFi VPS Setup - Step 3: Nginx + SSL
# Run as root

set -euo pipefail

DOMAIN="${1:-app.perkyfi.xyz}"

echo "🚀 PerkyFi VPS Setup - Nginx + SSL"
echo "==================================="
echo "Domain: $DOMAIN"

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create webroot for certbot
mkdir -p /var/www/certbot

# Copy nginx config
echo "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/perkyfi << 'NGINX'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.perkyfi.xyz;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}
NGINX

# Enable site
ln -sf /etc/nginx/sites-available/perkyfi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx

echo ""
echo "⚙️ Obtaining SSL certificate..."
echo "   (This requires DNS to be pointed to this server)"
echo ""

# Get SSL certificate
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@perkyfi.xyz || {
    echo "⚠️ Certbot failed. Make sure DNS is configured."
    echo "   Run manually: certbot --nginx -d $DOMAIN"
}

# Setup auto-renewal cron
echo "⚙️ Setting up SSL auto-renewal..."
cat > /etc/cron.d/certbot-renew << 'CRON'
# Renew SSL certificates twice daily
0 0,12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
CRON

# Update nginx config with SSL
cat > /etc/nginx/sites-available/perkyfi << 'NGINX'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.perkyfi.xyz;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name app.perkyfi.xyz;

    ssl_certificate /etc/letsencrypt/live/app.perkyfi.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.perkyfi.xyz/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # API routes (rate limited)
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # x402 headers
        proxy_set_header Payment-Signature $http_payment_signature;
        proxy_pass_header Payment-Required;
        proxy_pass_header Payment-Response;
    }

    # A2A Agent Card
    location /.well-known/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Test and reload
nginx -t && systemctl reload nginx

echo ""
echo "✅ Nginx + SSL setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run: ./setup-agent.sh"
echo "  2. Deploy the app: ./deploy.sh"
echo ""
