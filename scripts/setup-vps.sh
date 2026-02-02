#!/bin/bash
# PerkyFi VPS Setup - Step 1: Base System + Security Hardening
# Run as root on fresh VPS
# Based on VittoStack's security guide: https://x.com/vittostack/status/2018326025373900881

set -euo pipefail

echo "🚀 PerkyFi VPS Setup - Base System + Security"
echo "=============================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essentials
echo "📦 Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    jq \
    unzip \
    htop \
    tmux \
    vim \
    build-essential \
    gnupg

# =============================================================================
# AUTOMATIC SECURITY UPDATES
# =============================================================================
echo "🔒 Enabling automatic security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades <<< "yes"

# =============================================================================
# TAILSCALE (Zero-trust network)
# =============================================================================
echo "🔒 Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

echo ""
echo "⚠️  IMPORTANT: Run 'tailscale up' and authorize this device"
echo "   Then get your Tailscale IP: tailscale ip -4"
echo ""

# =============================================================================
# FIREWALL (UFW) - STRICT MODE
# =============================================================================
echo "🔒 Configuring firewall (UFW) - STRICT MODE..."
apt install -y ufw

ufw default deny incoming
ufw default allow outgoing

# SSH - Allow from Tailscale interface ONLY (once configured)
# For initial setup, allow SSH on all interfaces temporarily
ufw allow 22/tcp comment 'SSH - TEMPORARY, restrict to tailscale0 after setup'

# Web traffic (Nginx)
ufw allow 80/tcp comment 'HTTP - certbot + redirect'
ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
echo "y" | ufw enable
ufw status verbose

echo ""
echo "⚠️  After Tailscale is configured, run:"
echo "    ufw delete allow 22/tcp"
echo "    ufw allow in on tailscale0 to any port 22 comment 'SSH via Tailscale only'"
echo ""

# =============================================================================
# FAIL2BAN (Brute-force protection)
# =============================================================================
echo "🔒 Installing and configuring fail2ban..."
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban

# =============================================================================
# SSH HARDENING
# =============================================================================
echo "🔒 Hardening SSH configuration..."

# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Apply hardening
cat >> /etc/ssh/sshd_config << 'SSHD'

# PerkyFi Security Hardening
PasswordAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PermitEmptyPasswords no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 60
ClientAliveInterval 300
ClientAliveCountMax 2
SSHD

# Test and restart
sshd -t && systemctl restart sshd

# =============================================================================
# CREATE PERKYFI USER (Non-root operation)
# =============================================================================
echo "👤 Creating perkyfi user (non-root operation)..."
if ! id "perkyfi" &>/dev/null; then
    useradd -m -s /bin/bash perkyfi
    usermod -aG sudo perkyfi
    
    # Copy SSH keys from root
    mkdir -p /home/perkyfi/.ssh
    cp /root/.ssh/authorized_keys /home/perkyfi/.ssh/ 2>/dev/null || true
    chown -R perkyfi:perkyfi /home/perkyfi/.ssh
    chmod 700 /home/perkyfi/.ssh
    chmod 600 /home/perkyfi/.ssh/authorized_keys 2>/dev/null || true
fi

# =============================================================================
# CREATE DIRECTORIES
# =============================================================================
echo "📁 Creating application directories..."
mkdir -p /home/perkyfi/perkyfi
chown -R perkyfi:perkyfi /home/perkyfi/perkyfi

# Keep /root/perkyfi as symlink for compatibility
ln -sf /home/perkyfi/perkyfi /root/perkyfi 2>/dev/null || true

# =============================================================================
# DISABLE MDNS BROADCASTING
# =============================================================================
echo "🔒 Disabling mDNS broadcasting..."
echo 'export OPENCLAW_DISABLE_BONJOUR=1' >> /etc/environment
echo 'export CLAWDBOT_DISABLE_BONJOUR=1' >> /etc/environment

# =============================================================================
# TIMEZONE
# =============================================================================
echo "🕐 Setting timezone to America/New_York..."
timedatectl set-timezone America/New_York

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "✅ Base system + security setup complete!"
echo ""
echo "🔒 Security measures applied:"
echo "   ✓ Automatic security updates enabled"
echo "   ✓ Tailscale installed (run 'tailscale up' to configure)"
echo "   ✓ UFW firewall enabled (ports 22, 80, 443)"
echo "   ✓ fail2ban configured (24h ban after 3 failed SSH attempts)"
echo "   ✓ SSH hardened (key-only, no password, max 3 retries)"
echo "   ✓ Non-root user 'perkyfi' created"
echo "   ✓ mDNS broadcasting disabled"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "   1. Run: tailscale up"
echo "   2. Authorize device in Tailscale admin"
echo "   3. Get Tailscale IP: tailscale ip -4"
echo "   4. Restrict SSH to Tailscale only:"
echo "      ufw delete allow 22/tcp"
echo "      ufw allow in on tailscale0 to any port 22"
echo ""
echo "   Then continue with:"
echo "   5. ./setup-node.sh"
echo "   6. ./setup-nginx.sh"
echo "   7. ./setup-agent.sh"
echo "   8. ./setup-security.sh"
echo ""
