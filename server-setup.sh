#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Prisom — Server Setup Script (Run on EC2)
#  This script sets up a FRESH Ubuntu 22.04/24.04 EC2
#  instance with everything needed to run Prisom.
# ═══════════════════════════════════════════════════════
#
#  Usage:
#    chmod +x server-setup.sh
#    ./server-setup.sh
#
# ═══════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ──────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()     { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ─── Configuration ──────────────────────────────────
APP_DIR="/home/ubuntu/news-automation"
LOG_DIR="/home/ubuntu/logs"
DB_NAME="prisom_db"
DB_USER="prisom"
DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"

echo -e "${BOLD}${CYAN}"
echo "═══════════════════════════════════════════════════"
echo "  🚀 Prisom — Server Setup"
echo "═══════════════════════════════════════════════════"
echo -e "${NC}"
echo -e "  Server IP:  $(curl -s ifconfig.me 2>/dev/null || echo 'unknown')"
echo -e "  DB Name:    ${DB_NAME}"
echo -e "  DB User:    ${DB_USER}"
echo -e "  DB Pass:    ${DB_PASS}"
echo -e "  App Dir:    ${APP_DIR}"
echo ""
echo -e "${YELLOW}⚠️  SAVE THE DB PASSWORD ABOVE! You'll need it for .env${NC}"
echo ""
read -p "Press ENTER to continue or Ctrl+C to abort..."

# ═══════════════════════════════════════════════════════
# STEP 1: System Update
# ═══════════════════════════════════════════════════════
log "STEP 1/8: Updating system packages"
sudo apt update && sudo apt upgrade -y
success "System updated"

# ═══════════════════════════════════════════════════════
# STEP 2: Install Node.js 20 LTS
# ═══════════════════════════════════════════════════════
log "STEP 2/8: Installing Node.js 20 LTS"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "  Node: $(node -v)"
echo "  NPM:  $(npm -v)"
success "Node.js installed"

# ═══════════════════════════════════════════════════════
# STEP 3: Install PostgreSQL 16
# ═══════════════════════════════════════════════════════
log "STEP 3/8: Installing PostgreSQL"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

success "PostgreSQL installed & database '${DB_NAME}' created"

# ═══════════════════════════════════════════════════════
# STEP 4: Install Nginx
# ═══════════════════════════════════════════════════════
log "STEP 4/8: Installing Nginx"
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
success "Nginx installed"

# ═══════════════════════════════════════════════════════
# STEP 5: Install PM2
# ═══════════════════════════════════════════════════════
log "STEP 5/8: Installing PM2"
sudo npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
success "PM2 installed"

# ═══════════════════════════════════════════════════════
# STEP 6: Clone Repository & Install Dependencies
# ═══════════════════════════════════════════════════════
log "STEP 6/8: Cloning repository"
mkdir -p "$LOG_DIR"

if [ -d "$APP_DIR" ]; then
  warn "App directory already exists — pulling latest..."
  cd "$APP_DIR"
  git pull origin main
else
  git clone https://github.com/rabeeh20/news-automation.git "$APP_DIR"
  cd "$APP_DIR"
fi

# Install dependencies
npm install --production=false
success "Repository cloned & dependencies installed"

# ═══════════════════════════════════════════════════════
# STEP 7: Create .env file
# ═══════════════════════════════════════════════════════
log "STEP 7/8: Creating .env configuration"

NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)

cat > "$APP_DIR/.env" <<EOF
# ─── Database ────────────────────────────────────────
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# ─── Google Gemini AI ────────────────────────────────
GEMINI_API_KEY="REPLACE_WITH_YOUR_GEMINI_API_KEY"

# ─── NextAuth.js ─────────────────────────────────────
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="http://15.207.12.169"

# ─── Admin Credentials ──────────────────────────────
ADMIN_EMAIL="admin@prisom.live"
ADMIN_PASSWORD="admin123"

# ─── Google AdSense ──────────────────────────────────
NEXT_PUBLIC_ADSENSE_ID=""

# ─── Cron Configuration ─────────────────────────────
CRON_START_HOUR=6
CRON_END_HOUR=18
CRON_INTERVAL_MINUTES=30

# ─── RSS Feed ────────────────────────────────────────
RSS_FEED_URL="https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?gl=IN&hl=en-IN"
EOF

success ".env created (⚠️  Remember to update GEMINI_API_KEY!)"

# ═══════════════════════════════════════════════════════
# STEP 8: Build & Deploy
# ═══════════════════════════════════════════════════════
log "STEP 8/8: Building & deploying application"

cd "$APP_DIR"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy 2>/dev/null || npx prisma db push

# Build Next.js
npm run build

# ─── Configure Nginx (HTTP only for now) ─────────────
sudo tee /etc/nginx/sites-available/prisom > /dev/null <<'NGINX'
# ─── Rate Limiting ──────────────────────────────────
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

server {
    listen 80;
    listen [::]:80;
    server_name 15.207.12.169 prisom.live www.prisom.live;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # ─── Gzip Compression ──────────────────────────
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/rss+xml
        application/atom+xml
        image/svg+xml
        font/woff2;

    # ─── Security Headers ──────────────────────────
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ─── Static Assets (Next.js build output) ──────
    location /_next/static/ {
        alias /home/ubuntu/news-automation/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /favicon.ico {
        alias /home/ubuntu/news-automation/public/favicon.ico;
        expires 365d;
        access_log off;
    }

    location /ads.txt {
        alias /home/ubuntu/news-automation/public/ads.txt;
        expires 1d;
        access_log off;
    }

    # ─── API Rate Limiting ─────────────────────────
    location /api/ {
        limit_req zone=api burst=10 nodelay;
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

    # ─── Reverse Proxy to Next.js ──────────────────
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # ─── Block Sensitive Paths ─────────────────────
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \.(env|git|bak|sql|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX

# Enable site & remove default
sudo ln -sf /etc/nginx/sites-available/prisom /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ─── Start PM2 ──────────────────────────────────────
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

success "Application deployed & running!"

# ═══════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}${GREEN}"
echo "═══════════════════════════════════════════════════"
echo "  🎉  Prisom — Setup Complete!"
echo "═══════════════════════════════════════════════════"
echo -e "${NC}"
echo -e "  🌐 Site:       ${CYAN}http://15.207.12.169${NC}"
echo -e "  🔐 Admin:      ${CYAN}http://15.207.12.169/admin${NC}"
echo -e "  📧 Admin User: admin@prisom.live"
echo -e "  🔑 Admin Pass: admin123"
echo ""
echo -e "  ${YELLOW}⚠️  IMPORTANT — Do these next:${NC}"
echo -e "  1. Edit .env & set your GEMINI_API_KEY:"
echo -e "     ${CYAN}nano /home/ubuntu/news-automation/.env${NC}"
echo -e "  2. Change admin password in .env"
echo -e "  3. For SSL (optional), run:"
echo -e "     ${CYAN}sudo apt install certbot python3-certbot-nginx${NC}"
echo -e "     ${CYAN}sudo certbot --nginx -d prisom.live -d www.prisom.live${NC}"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "  ${CYAN}pm2 list${NC}                    — Process status"
echo -e "  ${CYAN}pm2 logs prisom-web${NC}          — Web server logs"
echo -e "  ${CYAN}pm2 logs prisom-cron${NC}         — Cron worker logs"
echo -e "  ${CYAN}pm2 monit${NC}                    — Real-time dashboard"
echo -e "  ${CYAN}cd ~/news-automation && ./deploy.sh${NC} — Update deployment"
echo ""
echo -e "  ${BOLD}Database:${NC}"
echo -e "  DB Name: ${DB_NAME}"
echo -e "  DB User: ${DB_USER}"
echo -e "  DB Pass: ${DB_PASS}"
echo ""
