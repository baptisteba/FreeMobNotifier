# FreeMobNotifier PWA Deployment Guide

This guide covers deployment of your FreeMobNotifier PWA application with external reverse proxy support.

## 🐳 Docker Deployment

The application is designed to run behind a reverse proxy that handles SSL/HTTPS. The app itself serves plain HTTP and trusts the proxy for protocol and IP detection.

### Simple Deployment

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

**Access**: `http://localhost:18596` (direct access) or through your reverse proxy

**Note**: For full PWA functionality in production, you need HTTPS provided by your reverse proxy.

## 🔧 Production Setup with Reverse Proxy

### 1. Prerequisites

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy FreeMobNotifier

```bash
# Clone and deploy the application
git clone <your-repo-url>
cd FreeMobNotifier

# Start the application
docker-compose up -d

# Verify it's running
docker-compose ps
docker-compose logs -f
```

The application will be available at `http://localhost:18596`

### 3. Reverse Proxy Configuration

Your external reverse proxy should:

1. **Handle SSL/HTTPS termination**
2. **Forward requests to** `http://freemobnotifier-app:3000` (if same Docker network) or `http://localhost:18596`
3. **Pass proper headers** for PWA functionality

#### Example Nginx Reverse Proxy Config:

```nginx
upstream freemobnotifier {
    server localhost:18596;  # Or container IP/name
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # Your SSL configuration here
    
    location / {
        proxy_pass http://freemobnotifier;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Example Traefik Labels (if using Traefik):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.freemob.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.freemob.entrypoints=websecure"
  - "traefik.http.routers.freemob.tls.certresolver=letsencrypt"
  - "traefik.http.services.freemob.loadbalancer.server.port=3000"
```

## 🚀 Quick Deployment

### Standard Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd FreeMobNotifier

# Generate PWA icons (optional)
# Visit http://localhost:18596/generate-icons.html after starting
# Place generated icons in src/client/public/icons/

# Start the application
docker-compose up -d

# Check if everything is running
docker-compose ps
docker-compose logs -f

# Useful commands
npm run docker:up      # Start containers
npm run docker:down    # Stop containers  
npm run docker:logs    # View logs
```

### Docker Network Integration

If integrating with an existing Docker network (e.g., with Traefik):

```bash
# Create external network (if not exists)
docker network create traefik-network

# Update docker-compose.yml to use external network
# Change 'external: false' to 'external: true' and network name
```

## 📱 PWA Verification

After deployment, verify your PWA is working correctly:

### 1. Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit
5. Aim for 90+ score

### 2. Manual Testing

**Android (Chrome/Edge/Samsung Internet):**
- Visit your site
- Look for install prompt
- Click "Install App" button in navbar
- Verify app installs on home screen

**iOS (Safari):**
- Visit your site in Safari
- Tap Share button
- Select "Add to Home Screen"
- Verify app appears on home screen

**Desktop (Chrome/Edge):**
- Visit your site
- Look for install icon in address bar
- Or click "Install App" button
- Verify app installs as desktop application

### 3. Offline Testing

1. Install the PWA
2. Disconnect from internet
3. Open the installed app
4. Verify offline page appears for new content
5. Verify cached content still works

## 🔍 Troubleshooting

### Common Issues

**PWA not installing:**
```bash
# Check if HTTPS is working
curl -I https://your-domain.com

# Check manifest.json
curl https://your-domain.com/manifest.json

# Check service worker
curl https://your-domain.com/sw.js
```

**Service Worker errors:**
```bash
# Check service worker registration in browser console
# Look for errors in Network tab
# Verify sw.js is served with correct headers
```

**Reverse Proxy issues:**
```bash
# Check if application is responding
curl -I http://localhost:18596

# Check application health
curl http://localhost:18596/api/settings

# Test from reverse proxy server
curl -H "Host: your-domain.com" http://localhost:18596
```

### Monitoring and Logs

```bash
# View application logs
docker-compose logs -f

# Monitor container
docker stats freemobnotifier-app

# Check container health
docker inspect freemobnotifier-app | grep Health -A 10
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] HTTPS enabled on reverse proxy with valid SSL certificate
- [ ] Security headers configured on reverse proxy
- [ ] Regular security updates for Docker images
- [ ] Firewall configured (only necessary ports open)
- [ ] Strong passwords and SSH keys
- [ ] Regular backups of data directory
- [ ] Monitor logs for suspicious activity
- [ ] Reverse proxy properly configured with security headers

### Backup Strategy

```bash
# Backup data directory
tar -czf freemob-backup-$(date +%Y%m%d).tar.gz data/

# Backup using Docker volume
docker run --rm -v $(pwd)/data:/source -v $(pwd)/backups:/backup alpine tar czf /backup/freemob-data-$(date +%Y%m%d).tar.gz -C /source .
```

## 📊 Performance Optimization

### Recommended Server Specifications

- **Minimum**: 1 CPU, 1GB RAM, 10GB storage
- **Recommended**: 2 CPU, 2GB RAM, 20GB storage
- **Network**: Minimum 10 Mbps upload for good PWA performance

### Performance Monitoring

1. Use Lighthouse for regular PWA audits
2. Monitor Docker container resources
3. Set up log rotation to prevent disk space issues
4. Consider using a CDN for static assets in high-traffic scenarios

## 🎯 Next Steps

1. **Deploy**: Choose your deployment method and follow the steps
2. **Test**: Verify PWA functionality on different devices
3. **Monitor**: Set up monitoring and log analysis
4. **Maintain**: Regular updates and security patches
5. **Scale**: Consider load balancing for high traffic

Your FreeMobNotifier PWA is now ready for production deployment! 🚀 