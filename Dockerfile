# Drivers Dashboard Dockerfile
# Build a lightweight container for the static web application

# Use the official nginx alpine image for a small footprint
FROM docker.io/library/nginx:alpine

# Set maintainer label
LABEL maintainer="Drivers Dashboard <dashboard@example.com>"
LABEL description="ScyllaDB Drivers Dashboard - Static web application for monitoring database driver releases"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the dashboard files to nginx's default html directory
COPY . /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Create a non-root user for security (nginx already runs as nginx user)
# The nginx alpine image already handles this properly

# Expose port 80 for the web server
EXPOSE 80

# Add health check to ensure the container is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Default command (inherited from nginx:alpine)
# CMD ["nginx", "-g", "daemon off;"]

# Override the default nginx command to ensure it runs in foreground
CMD ["nginx", "-g", "daemon off;"]
