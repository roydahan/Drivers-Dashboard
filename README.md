# Drivers Dashboard

A specialized dashboard for monitoring database driver releases across Scylla and Cassandra ecosystems. Tracks the latest releases and compatibility status for popular database drivers.

## Features

- **Smart Caching**: Stores data locally in browser and updates only once per day from GitHub
- **Driver Release Tracking**: Monitors latest releases from ScyllaDB and Apache Cassandra driver repositories
- **Version Comparison**: Shows equivalent releases between Scylla and Cassandra drivers
- **Support Matrix**: Visual indicators of compatibility status
- **Cache Status Indicators**: Shows whether data is from cache or freshly fetched
- **Manual Force Refresh**: Button to immediately update data from GitHub
- **GitHub Integration**: Direct links to release pages on GitHub
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Gracefully handles API failures and network issues

## 🔒 GitHub API Authentication

The dashboard uses GitHub API to fetch release information. Without authentication, you're limited to 60 requests/hour. With authentication, you get 5,000 requests/hour.

### Security-First Approaches (Choose One):

#### **Option 1: Config File (Recommended for Local Development)**
```bash
# Run the secure setup script
./setup-token.sh

# This creates config.js (not committed to git) with your token
```

#### **Option 2: Build-Time Injection (Recommended for Deployment)**
```bash
# Set token as environment variable
export GITHUB_TOKEN=your_token_here

# Build with token injection
./build.sh

# Deploy only files from ./dist/ (token is injected, not stored)
```

#### **Option 3: Manual Config File**
```javascript
// Create config.js (add to .gitignore)
const GITHUB_TOKEN = 'your_github_token_here';
window.GITHUB_CONFIG = { GITHUB_TOKEN };
```

### Creating a GitHub Token:

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Name:** "Drivers Dashboard"
4. **Scopes:** Check `public_repo`
5. **Generate & Copy** the token

### 🚨 **Important: HTTPS Requirement**

**The dashboard MUST be served over HTTPS** when using GitHub API authentication. HTTP localhost cannot make HTTPS API calls due to browser security policies (mixed content).

#### **Quick HTTPS Solution (Recommended):**
```bash
# Use the provided HTTPS server script
python3 serve-https.py

# Or with mkcert for better certificates
brew install mkcert  # macOS
mkcert -install
mkcert localhost
python3 serve-https.py  # Uses mkcert certificates if available
```

#### **Alternative: Use Docker**
```bash
# Use the alternative Dockerfile (no external images needed)
docker build -f Dockerfile.alpine -t drivers-dashboard .
docker run -p 8080:80 drivers-dashboard
```

### Security Best Practices:

- ✅ **Never commit tokens** to version control
- ✅ **Use classic tokens** (not fine-grained with long lifetimes)
- ✅ **Regularly rotate tokens** in GitHub settings
- ✅ **Deploy only built files** (with build-time injection)
- ✅ **Use environment variables** in production
- ✅ **Monitor token usage** in GitHub settings

## Columns

The dashboard displays six key columns:

1. **Driver Name**: The database driver name and brief description
2. **Latest Scylla Release**: Most recent stable release from ScyllaDB repositories
3. **Equivalent Cassandra Release**: Corresponding release from Apache Cassandra repositories (N/A for Scylla-specific drivers)
4. **State vs Upstream**: Comparison status with upstream Apache Cassandra version
5. **Release Quarter**: Quarter and year of latest Scylla release, with current quarter highlighting
6. **ScyllaDB Support**: Official support status according to [ScyllaDB driver support policy](https://docs.scylladb.com/stable/versioning/driver-support.html)

## Monitored Drivers

The dashboard currently tracks the following database drivers:

1. **scylla-rust-driver** - Rust CQL driver ([Scylla](https://github.com/scylladb/scylla-rust-driver/releases)) | Cassandra: N/A
2. **gocql** - Go CQL driver ([Scylla](https://github.com/scylladb/gocql/releases)) | Cassandra: [gocql/gocql](https://github.com/gocql/gocql)
3. **cpp-driver** - C++ Cassandra driver ([Scylla](https://github.com/scylladb/cpp-driver/releases)) | Cassandra: [apache/cassandra-cpp-driver](https://github.com/apache/cassandra-cpp-driver)
4. **java-driver-3x** - Java Cassandra driver 3.x ([Scylla](https://github.com/scylladb/java-driver/releases)) | Cassandra: [apache/cassandra-java-driver](https://github.com/apache/cassandra-java-driver)
5. **java-driver-4x** - Java Cassandra driver 4.x ([Scylla](https://github.com/scylladb/java-driver/releases)) | Cassandra: [apache/cassandra-java-driver](https://github.com/apache/cassandra-java-driver)
6. **python-driver** - Python Cassandra driver ([Scylla](https://github.com/scylladb/python-driver)) | Cassandra: [apache/cassandra-python-driver](https://github.com/apache/cassandra-python-driver) (uses tags)
7. **cpp-rs-driver** - C++ Rust-style driver ([Scylla](https://github.com/scylladb/cpp-rs-driver/releases/)) | Cassandra: N/A
8. **csharp-driver** - C# Cassandra driver ([Scylla](https://github.com/scylladb/csharp-driver/releases)) | Cassandra: [datastax/csharp-driver](https://github.com/datastax/csharp-driver) (uses tags)
9. **nodejs-rs-driver** - Node.js Rust-style driver ([Scylla](https://github.com/scylladb/nodejs-rs-driver)) | Cassandra: N/A

## Getting Started

### Prerequisites

- A web browser
- Python 3 (for local development)
- Docker (for containerized deployment)
- Web server (Apache/Nginx) for production deployment
- Internet connection (for GitHub API access)

### Running Locally

1. Clone or download the project files
2. Open a terminal and navigate to the project directory
3. Start the local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

## Docker Deployment

The easiest way to deploy the Drivers Dashboard is using Docker. All necessary files are included.

### Quick Start with Docker

```bash
# Clone or navigate to the project directory
cd Drivers-Dashboard

# Build and run with the automated script
./build-docker.sh

# Or use docker-compose for more features
docker-compose up -d
```

### Docker Files Included

- **`Dockerfile`** - Multi-stage build with nginx alpine
- **`Dockerfile.alpine`** - Alternative using Alpine directly (no external images)
- **`docker-compose.yml`** - Container orchestration with Traefik labels
- **`nginx.conf`** - Optimized nginx configuration with CORS and caching
- **`.dockerignore`** - Excludes unnecessary files from build context
- **`build-docker.sh`** - Automated build and deployment script

### Docker Features

- **🚀 Lightweight**: Based on nginx alpine (~20MB)
- **🔒 Security**: Non-root user, security headers
- **⚡ Performance**: Gzip compression, optimized caching
- **🌐 CORS Ready**: Pre-configured for GitHub API calls
- **🏥 Health Checks**: Built-in container monitoring
- **🔄 Reverse Proxy**: Traefik labels for load balancing
- **📊 Production Ready**: Optimized for high traffic

### Accessing the Dashboard

**Local Docker:**
- `http://localhost:8080` (default docker-compose port)

**With Traefik:**
- `https://drivers.yourdomain.com` (configure domain in docker-compose.yml)

**Direct Docker Run:**
```bash
docker run -p 8080:80 drivers-dashboard
# Access: http://localhost:8080
```

### Docker Commands

```bash
# Build the image
docker build -t drivers-dashboard .

# Run container
docker run -d -p 8080:80 --name drivers-dashboard drivers-dashboard

# View logs
docker logs drivers-dashboard

# Stop container
docker stop drivers-dashboard

# Clean up
docker rm drivers-dashboard
docker rmi drivers-dashboard
```

### Docker Troubleshooting

**Error: "ERROR [internal] load metadata for docker.io/library/nginx:alpine"**

This error occurs when Docker can't pull the base nginx:alpine image. Try these solutions:

#### 1. Check Docker Status
```bash
# Check if Docker is running
docker --version
docker info

# On macOS/Linux
sudo systemctl status docker  # Linux
# On macOS: Check Docker Desktop is running
```

#### 2. Test Internet Connection
```bash
# Test basic connectivity
ping google.com

# Test Docker Hub connectivity
curl -I https://registry-1.docker.io/v2/
```

#### 3. Login to Docker Hub (if needed)
```bash
docker login
# Enter your Docker Hub credentials if required
```

#### 4. Pull Base Image Manually
```bash
# Try pulling the base image directly
docker pull nginx:alpine

# If that fails, try with explicit registry
docker pull docker.io/library/nginx:alpine
```

#### 5. Use Alternative Build Options
```bash
# Build with no cache
docker build --no-cache -t drivers-dashboard .

# Build with verbose output
docker build --progress=plain -t drivers-dashboard .

# Use a different tag
docker build -t drivers-dashboard:v1 .
```

#### 6. Alternative Base Images
If nginx:alpine continues to fail, temporarily modify the Dockerfile:

```dockerfile
# Replace line 5 in Dockerfile with:
FROM nginx:1.25-alpine
# or
FROM nginx:latest
# or
FROM httpd:alpine  # Apache instead of nginx
```

#### 7. Behind Corporate Proxy/Firewall
Configure Docker proxy settings in `~/.docker/config.json`:

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.company.com:8080",
      "httpsProxy": "http://proxy.company.com:8080",
      "noProxy": "localhost,127.0.0.1,.company.com"
    }
  }
}
```

#### 8. Docker Desktop (macOS/Windows)
- Ensure Docker Desktop is running
- Check Docker Desktop settings for resource allocation
- Restart Docker Desktop if needed

### Quick Diagnosis Script

Create a diagnostic script to identify the issue:

```bash
#!/bin/bash
echo "=== Docker Diagnostics ==="
echo "Docker version: $(docker --version)"
echo "Docker info: $(docker info 2>/dev/null | head -5)"
echo ""
echo "=== Network Tests ==="
echo "Internet: $(ping -c 1 google.com 2>/dev/null && echo OK || echo FAIL)"
echo "Docker Hub: $(curl -s -I https://registry-1.docker.io/v2/ | head -1)"
echo ""
echo "=== Docker Images ==="
docker images nginx
echo ""
echo "=== Build Test ==="
docker build --dry-run -t test-build . 2>&1 || echo "Dry run not supported"
```

### Docker Compose with Traefik

The `docker-compose.yml` includes Traefik labels for automatic reverse proxy configuration:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.drivers-dashboard.rule=Host(`drivers.yourdomain.com`)"
```

### Production Deployment

1. **Update domain** in `docker-compose.yml`
2. **Ensure Traefik network** exists: `docker network create web`
3. **Deploy**: `docker-compose up -d`
4. **SSL**: Traefik handles automatic HTTPS certificates

## Deployment on Existing Server

Since this is a static web application, you can deploy it alongside an existing HTTP server. Here are several deployment options:

### Option 1: Serve as Static Files (Recommended)

**Copy the dashboard files to your web server's document root:**

```bash
# Assuming your web server serves from /var/www/html
sudo cp -r /path/to/Drivers-Dashboard/* /var/www/html/drivers/
```

**Access at:** `http://your-server/drivers/`

### Option 2: Nginx Configuration

**Add to your nginx configuration (`/etc/nginx/sites-available/default`):**

```nginx
server {
    listen 80;
    server_name your-server.com;

    # Existing configuration...

    # Add dashboard location
    location /drivers/ {
        alias /path/to/Drivers-Dashboard/;
        index index.html;

        # Enable CORS for GitHub API calls
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Cache static assets
        location ~* \.(css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Restart nginx:**
```bash
sudo systemctl restart nginx
```

**Access at:** `http://your-server/drivers/`

### Option 3: Apache Configuration

**Create a new virtual host or add to existing configuration:**

```apache
# In /etc/apache2/sites-available/000-default.conf or similar

<VirtualHost *:80>
    ServerName your-server.com

    # Existing configuration...

    # Dashboard alias
    Alias /drivers /path/to/Drivers-Dashboard
    <Directory "/path/to/Drivers-Dashboard">
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted

        # Enable CORS
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
        Header always set Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"

        # Cache control for static assets
        <FilesMatch "\.(css|js)$">
            ExpiresActive On
            ExpiresDefault "access plus 1 year"
            Header append Cache-Control "public, immutable"
        </FilesMatch>
    </Directory>
</VirtualHost>
```

**Enable headers module and restart:**
```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

**Access at:** `http://your-server/drivers/`

### Option 4: Reverse Proxy with Separate Port

**Run the dashboard on a different port and proxy through your main server:**

1. **Run dashboard on port 3000:**
   ```bash
   cd /path/to/Drivers-Dashboard
   python3 -m http.server 3000
   ```

2. **Or use a production server like gunicorn:**
   ```bash
   pip install gunicorn
   gunicorn --bind 127.0.0.1:3000 --workers 2 "wsgiref.simple_server:make_server('', 3000, app)" &
   ```

3. **Configure reverse proxy in nginx:**
   ```nginx
   location /drivers/ {
       proxy_pass http://127.0.0.1:3000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

### Option 5: Docker Deployment (Recommended)

**Build and run with the provided files:**

```bash
# Quick build and run
./build-docker.sh

# Or build manually
docker build -t drivers-dashboard .

# Run the container
docker run -p 8080:80 drivers-dashboard
```

**Using Alternative Dockerfile (no external images):**

```bash
# Build with alternative Dockerfile
docker build -f Dockerfile.alpine -t drivers-dashboard-alpine .

# Run the container
docker run -p 8080:80 drivers-dashboard-alpine
```

**Using Docker Compose (with Traefik labels):**

```bash
# Build and run with compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

**Docker Features:**
- ✅ **Optimized nginx configuration** with CORS headers
- ✅ **Security headers** and gzip compression
- ✅ **Health checks** for container monitoring
- ✅ **Multi-stage build** ready (alpine base)
- ✅ **Production-ready** static file serving
- ✅ **Traefik integration** labels included

### Option 6: Cloud Deployment

**For cloud platforms, you can:**

1. **Netlify/Vercel:** Upload the static files directly
2. **GitHub Pages:** Enable pages on your repository
3. **AWS S3 + CloudFront:** Host static files on S3 with CDN
4. **Firebase Hosting:** Deploy as a static site

### Security Considerations

- **HTTPS:** Ensure your main server uses HTTPS
- **CORS:** The dashboard needs CORS headers for GitHub API calls
- **Rate Limiting:** Consider implementing request limiting
- **Updates:** Set up automated deployment for dashboard updates

### Monitoring

- **Logs:** Check your web server logs for dashboard access
- **GitHub API:** Monitor API rate limit usage
- **Performance:** The dashboard loads quickly due to local caching

### Usage

- **Smart Caching**: Data is cached locally for 24 hours to reduce API calls
- **Cache Status**: Indicator shows data source (cache vs fresh from GitHub)
- **Manual Force Refresh**: Click **"Refresh Data"** to immediately fetch latest data from GitHub
- **Clear Cache**: Click **"Clear Cache"** to remove stored data and force fresh fetch
- **Auto-check**: Every hour, checks if cache is stale (older than 24 hours)
- **Release links**: Click "View Release" links to see full release details on GitHub
- **State vs Upstream**: Look for compatibility indicators (✅ Compatible, ⚠️ Ahead, 🔄 Behind)
- **Release Quarter**: Green highlighting indicates releases from the current quarter
- **ScyllaDB Support**: Green checkmark indicates officially supported versions

### Current Status

**Debugging repository access issues.** The dashboard now tests repository access on startup and provides detailed console logging.

### Debugging

**Browser Console Messages (F12):**
- 🧪 **Testing repository access**: Shows which repositories are being tested
- 📦 **Fetching releases**: Shows API calls in progress
- 📦 **Response status**: HTTP status codes (200 = success, 404 = not found)
- 📦 **Found X releases**: Number of releases discovered
- ❌ **Failed to fetch**: Specific error details

**Expected Behavior:**
1. **Page loads** → Cache cleared → Repository tests run
2. **Tests complete** → Data fetching begins
3. **Success**: Shows version numbers and release dates
4. **Failure**: Shows specific error messages

**Error Indicators:**
- **❌ Red errors**: Repository/access issues
- **🟡 Yellow "Rate limited"**: GitHub API rate limit exceeded (shows reset time)
- **Console shows**: Rate limit remaining and reset times

**Common Issues:**
- **"Failed to fetch releases (404)"**: Repository exists but has no releases
- **"Rate limited"**: GitHub API rate limit exceeded (60 requests/hour for unauthenticated)
- **"Failed to fetch releases (403)"**: May also indicate rate limiting
- **"Network error"**: CORS or connectivity issues

### GitHub API Rate Limits

**Unauthenticated requests:** 60 per hour per IP address
**Authenticated requests:** 5,000 per hour per user

**Current Configuration:**
✅ **GitHub authentication is configured** - 5,000 requests/hour limit active

**To change or update the token:**
1. Get a new token from: https://github.com/settings/tokens
2. Edit `script.js` and update the `GITHUB_TOKEN` variable
3. Refresh the page to use the new token

**Test Results:**
Check console for test results of known repositories like `scylladb/gocql`.

## Data Storage & Caching

**Browser Local Storage**: Driver data is stored locally in your browser and persists between sessions.

- **Cache Duration**: 24 hours (data automatically refreshes after this period)
- **Storage Location**: Browser's localStorage (per domain)
- **Privacy**: No data is sent to external servers except GitHub API calls
- **Persistence**: Data survives browser restarts and computer reboots
- **Special Handling**: Apache Cassandra Python and DataStax C# drivers use GitHub tags instead of releases for version detection, with proper tag creation dates

**Cache Management**:
- Data is automatically refreshed when cache expires (24 hours)
- Manual refresh button forces immediate update
- Clear cache button removes all stored data
- Cache status indicator shows data source (cache vs fresh)
- Corrupted cache is automatically detected and cleared

**Error Handling**:
- Repository not found: Shows "❌ Repository not found"
- No releases available: Shows "❌ No releases found"
- Network/CORS errors: Shows "❌ Network error"
- Timeout protection: 15s per driver, 30s total
- Detailed error information in browser console
- Graceful degradation: Shows available data even if some drivers fail (cache vs fresh from GitHub)

## Dashboard Features

**Table Sorting:** Drivers are automatically sorted by Scylla release date (newest first), so the most recently updated drivers appear at the top.

## Understanding State vs Upstream

The State vs Upstream column shows how the Scylla driver version compares to the equivalent Apache Cassandra driver version:

### For Drivers with Cassandra Equivalents:
- **✅ Compatible**: Scylla and Cassandra driver versions match exactly
- **⚠️ Ahead**: Scylla driver version is newer than Cassandra equivalent
- **🔄 Behind**: Scylla driver version is older than Cassandra equivalent

### For Scylla-Specific Drivers:
- **N/A**: Scylla-specific driver with no direct Cassandra equivalent

## Understanding ScyllaDB Support

The ScyllaDB Support column indicates whether the latest driver version is officially supported by ScyllaDB according to their [driver support policy](https://docs.scylladb.com/stable/versioning/driver-support.html).

**Support Status:**
- ✅ **Supported**: Version is in ScyllaDB's officially supported list
- ❌ **Not Supported**: Version is not in the supported list (may still work but not officially tested)
- **Unable to check**: Cannot determine support status due to errors

**Support Policy:**
- ScyllaDB supports the **two most recent minor releases** of each driver
- Supported versions are regularly updated on the official documentation
- Using unsupported versions may work but is not recommended for production

## Customization

### Adding New Drivers

To add new database drivers, edit the `drivers` array in `script.js`:

```javascript
{
    name: 'new-driver',
    scyllaRepo: 'scylladb/new-driver-repo',
    cassandraRepo: 'organization/cassandra-driver-repo',
    description: 'Brief description of the driver'
}
```

### Repository Mapping

- **scyllaRepo**: GitHub repository path for ScyllaDB's version of the driver
- **cassandraRepo**: GitHub repository path for the original Apache Cassandra driver

### Styling

Modify `styles.css` to customize the appearance:
- Change colors in the CSS custom properties
- Adjust table layout and responsiveness
- Modify gradient backgrounds

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Async/await, fetch API, DOM manipulation
- **Public APIs**: JSONPlaceholder, GitHub API, Random User API

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Troubleshooting

### CORS Issues

If you encounter CORS errors when adding new APIs:
- Use APIs that support CORS
- Consider using a proxy server
- Check browser console for specific error messages

### API Rate Limits

Some APIs may have rate limits. The dashboard handles errors gracefully, but you may need to:
- Reduce auto-refresh frequency
- Implement API key authentication for higher limits



## License

This project is open source and available under the MIT License.
