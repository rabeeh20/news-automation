#!/bin/bash
# ─── Prisom — Deployment Script ─────────────
# Run this on the EC2 server for updates:
#   ./deploy.sh          (normal deploy)
#   ./deploy.sh --fresh  (fresh deploy with migration)
# ─────────────────────────────────────────────────────

set -euo pipefail

APP_DIR="/home/ubuntu/news-automation"
LOG_DIR="/home/ubuntu/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# ─── Colors ──────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() { echo -e "${CYAN}[${TIMESTAMP}]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ─── Check we're in the right directory ──────────────
cd "$APP_DIR" || error "App directory not found: $APP_DIR"
log "📂 Working directory: $(pwd)"

# ─── Parse flags ────────────────────────────────────
FRESH=false
for arg in "$@"; do
  case $arg in
    --fresh) FRESH=true ;;
  esac
done

# ─── Step 1: Pull latest code ───────────────────────
log "📥 Pulling latest code from GitHub..."
git pull origin main || error "Git pull failed"
success "Code updated"

# ─── Step 2: Install dependencies ────────────────────
log "📦 Installing dependencies..."
npm install --production=false
success "Dependencies installed"

# ─── Step 3: Generate Prisma Client ──────────────────
log "🔧 Generating Prisma client..."
npx prisma generate
success "Prisma client generated"

# ─── Step 4: Run migrations (if --fresh or if pending) ─
if [ "$FRESH" = true ]; then
  log "🗃️ Running database migrations (fresh deploy)..."
  npx prisma migrate deploy
  success "Migrations applied"
else
  log "🗃️ Checking for pending migrations..."
  if npx prisma migrate status 2>&1 | grep -q "Following migration"; then
    warn "Pending migrations detected — running them..."
    npx prisma migrate deploy
    success "Migrations applied"
  else
    success "No pending migrations"
  fi
fi

# ─── Step 5: Build the application ──────────────────
log "🏗️ Building Next.js application..."
npm run build || error "Build failed"
success "Build complete"

# ─── Step 6: Restart PM2 processes ──────────────────
log "🔄 Restarting PM2 processes..."

# Stop gracefully first
pm2 stop ecosystem.config.js --silent 2>/dev/null || true

# Start/restart all processes
pm2 start ecosystem.config.js
pm2 save

success "PM2 processes restarted"

# ─── Step 7: Health check ────────────────────────────
log "🏥 Running health check..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  success "Health check passed — site is live!"
else
  warn "Health check returned non-200. Check pm2 logs for errors."
fi

# ─── Summary ─────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀 Prisom — Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "  📊 PM2 Status:"
pm2 list
echo ""
echo -e "  📝 Useful commands:"
echo -e "    ${CYAN}pm2 logs prisom-web${NC}   — View web server logs"
echo -e "    ${CYAN}pm2 logs prisom-cron${NC}  — View cron worker logs"
echo -e "    ${CYAN}pm2 monit${NC}                — Real-time monitoring"
echo -e "    ${CYAN}sudo nginx -t${NC}            — Test Nginx config"
echo -e "    ${CYAN}sudo systemctl reload nginx${NC} — Reload Nginx"
echo ""
