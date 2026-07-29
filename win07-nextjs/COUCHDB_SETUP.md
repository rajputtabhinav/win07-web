# CouchDB Setup & Deployment Guide for WIN07 Gaming Platform

This guide covers the complete setup of Apache CouchDB for the WIN07 gaming platform, with specific instructions for Hostinger hosting.

## 🗄️ **CouchDB vs MongoDB Migration**

We've migrated from MongoDB to Apache CouchDB for better compatibility with Apache-based hosting environments like Hostinger.

### **Benefits of CouchDB:**
- ✅ HTTP REST API (works great with Apache)
- ✅ Built-in replication and sync
- ✅ Better suited for distributed applications
- ✅ JSON document storage
- ✅ Offline-first design
- ✅ Web-based admin interface (Fauxton)

## 🚀 **Quick Start (Local Development)**

### **1. Install CouchDB Locally**

**Windows:**
```bash
# Using Chocolatey
choco install couchdb

# Or download from: https://couchdb.apache.org/
```

**Linux/Ubuntu:**
```bash
sudo apt update
sudo apt install couchdb
```

**macOS:**
```bash
brew install couchdb
```

**Docker (Recommended for Development):**
```bash
docker run -d --name couchdb \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  -p 5984:5984 \
  couchdb:latest
```

### **2. Configure Environment Variables**

Update your `.env.local` file:

```env
# CouchDB Configuration
COUCHDB_URL=http://admin:password@127.0.0.1:5984
COUCHDB_DATABASE=win07_platform

# Other settings...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### **3. Initialize Database**

```bash
# Setup CouchDB database and design documents
npm run setup:couchdb
```

### **4. Start Development Server**

```bash
npm run dev
```

---

## 🌐 **Production Deployment Options**

### **Option 1: Hostinger VPS with CouchDB (Recommended)**

**Prerequisites:**
- Hostinger VPS (minimum 2GB RAM)
- Ubuntu 20.04+ or CentOS 7+
- Root or sudo access

**Step 1: Install CouchDB on VPS**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install couchdb

# Configure CouchDB
sudo nano /opt/couchdb/etc/local.ini

# Add these lines:
[couchdb]
single_node=true

[httpd]
bind_address = 0.0.0.0
port = 5984

[admins]
admin = your_secure_password

# Restart CouchDB
sudo systemctl restart couchdb
sudo systemctl enable couchdb

# Configure firewall
sudo ufw allow 5984
```

**Step 2: Secure CouchDB**
```bash
# Create SSL certificate (Let's Encrypt recommended)
sudo certbot --nginx -d your-domain.com

# Update Nginx configuration for CouchDB proxy
sudo nano /etc/nginx/sites-available/your-domain.com

# Add CouchDB proxy configuration:
location /db/ {
    proxy_pass http://127.0.0.1:5984/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Environment Variables for Production:**
```env
COUCHDB_URL=https://admin:your_secure_password@your-domain.com/db
COUCHDB_DATABASE=win07_platform
```

---

### **Option 2: IBM Cloudant (CouchDB as a Service) - EASIEST**

IBM Cloudant is a hosted CouchDB service that's perfect for production.

**Setup Steps:**
1. Sign up at [IBM Cloud](https://cloud.ibm.com/)
2. Create a Cloudant instance
3. Create service credentials
4. Get your connection URL

**Environment Variables:**
```env
COUCHDB_URL=https://apikey-v2-your-api-key:your-password@your-account.cloudantnosqldb.appdomain.cloud
COUCHDB_DATABASE=win07_platform
```

**Pricing:** Free tier includes 1GB storage and 20 lookups/sec.

---

### **Option 3: CouchDB with Docker (Hostinger VPS)**

**Step 1: Install Docker**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Step 2: Create docker-compose.yml**
```yaml
version: '3.8'
services:
  couchdb:
    image: couchdb:3.3
    container_name: win07-couchdb
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=your_secure_password
    ports:
      - "5984:5984"
    volumes:
      - couchdb_data:/opt/couchdb/data
    restart: unless-stopped

volumes:
  couchdb_data:
```

**Step 3: Deploy**
```bash
docker-compose up -d
```

---

## 🔧 **Configuration Files**

### **Update package.json Scripts**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "setup:couchdb": "node scripts/setup-couchdb.js",
    "backup:couchdb": "node scripts/backup-couchdb.js",
    "restore:couchdb": "node scripts/restore-couchdb.js"
  }
}
```

### **Nginx Configuration for Hostinger**

Create `/etc/nginx/sites-available/win07-gaming`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Next.js Application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # CouchDB API (optional direct access)
    location /couchdb/ {
        proxy_pass http://127.0.0.1:5984/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Basic security headers
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

---

## 🔄 **Database Migration & Backup**

### **Backup Script**

Create `scripts/backup-couchdb.js`:

```javascript
const axios = require('axios');
const fs = require('fs');

const COUCHDB_URL = process.env.COUCHDB_URL;
const COUCHDB_DATABASE = process.env.COUCHDB_DATABASE;

async function backupDatabase() {
  try {
    const response = await axios.get(`${COUCHDB_URL}/${COUCHDB_DATABASE}/_all_docs?include_docs=true`);
    const backup = {
      timestamp: new Date().toISOString(),
      database: COUCHDB_DATABASE,
      docs: response.data.rows.map(row => row.doc)
    };
    
    const filename = `backup-${COUCHDB_DATABASE}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${filename}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

backupDatabase();
```

### **Setup Database Indexes**

```bash
# Run after CouchDB is installed
node scripts/setup-couchdb.js
```

---

## 🛡️ **Security Best Practices**

### **1. CouchDB Security**

```bash
# Disable Admin Party (should be done by default in CouchDB 3.x)
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/couchdb/require_valid_user -d '"true"'

# Set up proper admin user
curl -X PUT http://localhost:5984/_node/_local/_config/admins/admin -d '"secure_password"'

# Enable HTTPS only
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/httpd/secure_rewrites -d '"true"'
```

### **2. Environment Security**

```env
# Use strong passwords
COUCHDB_URL=https://admin:very_secure_random_password@your-server.com:5984

# Restrict CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Enable rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

---

## 📊 **Monitoring & Performance**

### **CouchDB Admin Interface**

Access Fauxton at: `http://your-server:5984/_utils/`

**Key Metrics to Monitor:**
- Document count
- Database size
- Request rate
- Replication status

### **Performance Optimization**

```javascript
// In your CouchDB configuration
{
  "couchdb": {
    "max_document_size": 67108864,
    "os_process_timeout": 120000,
    "max_dbs_open": 500
  },
  "httpd": {
    "max_connections": 2048
  }
}
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Connection Refused**
```bash
# Check if CouchDB is running
sudo systemctl status couchdb

# Check logs
sudo journalctl -u couchdb -f
```

**2. CORS Issues**
```bash
# Enable CORS for your domain
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/cors/origins -d '"https://your-domain.com"'
```

**3. Performance Issues**
```bash
# Increase file descriptors
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

---

## ✅ **Deployment Checklist**

### **Pre-deployment:**
- [ ] CouchDB installed and configured
- [ ] Database initialized with setup script
- [ ] SSL certificates configured
- [ ] Firewall rules set
- [ ] Environment variables set
- [ ] Backup strategy implemented

### **Post-deployment:**
- [ ] Test user registration
- [ ] Test wallet operations
- [ ] Test game functionality
- [ ] Monitor error logs
- [ ] Verify data persistence
- [ ] Test failover scenarios

---

## 📞 **Support**

For issues specific to CouchDB setup:
1. Check CouchDB logs: `/opt/couchdb/var/log/couchdb.log`
2. CouchDB Documentation: https://docs.couchdb.org/
3. Community Support: https://couchdb.apache.org/#mailing-lists

For WIN07 platform issues:
- Check application logs
- Monitor CouchDB admin interface
- Review environment configuration
