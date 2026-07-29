# VPS Deployment Guide for "Authentic"

This guide walks you through deploying **Authentic** to any Linux VPS (Ubuntu, Debian, DigitalOcean, Hetzner, AWS EC2, Linode, Vultr).

---

## 🚀 Option A: Docker Deployment (Recommended)

Docker provides zero-downtime containers, isolated execution, and persistent database volumes.

### Step 1: Connect to your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Install Docker & Docker Compose
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version
docker compose version
```

### Step 3: Clone Repository & Build Containers
```bash
# Clone your project repo onto the VPS
git clone https://github.com/YOUR_USERNAME/authentic.git /var/www/authentic
cd /var/www/authentic

# Build and start services in detached mode
docker compose up -d --build
```

Your app is now live at `http://YOUR_VPS_IP`!

---

## 🔒 Step 4: Add Domain & Free SSL Certificate (HTTPS)

### 1. Point Domain to VPS
In your domain provider DNS settings (Namecheap, Cloudflare, GoDaddy, etc.):
- Add an **A Record**: `@` ➔ `YOUR_VPS_IP`
- Add an **A Record**: `www` ➔ `YOUR_VPS_IP`

### 2. Install Certbot for HTTPS
```bash
sudo apt install certbot python3-certbot-nginx -y

# Obtain and automatically install Let's Encrypt SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically manage auto-renewal every 90 days.

---

## 🛠️ Useful Production Management Commands

### Check container logs
```bash
docker compose logs -f
```

### Restart app services
```bash
docker compose restart
```

### Pull code updates & redeploy cleanly
```bash
git pull
docker compose up -d --build
```

---

## 📦 Option B: Non-Docker Deployment (PM2 + Nginx)

If you prefer running directly on the Linux host without Docker:

```bash
# 1. Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# 2. Build Frontend
cd /var/www/authentic/client
npm install
npm run build

# 3. Start Backend with PM2
cd /var/www/authentic/server
npm install
pm2 start index.js --name "authentic-api"
pm2 save
pm2 startup

# 4. Copy Nginx Config & Restart
sudo cp /var/www/authentic/nginx.conf /etc/nginx/sites-available/authentic
sudo ln -s /etc/nginx/sites-available/authentic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
