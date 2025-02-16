# Main server block for HTTPS

server {

# Define the domain name this server block responds to

server_name api.uibutler.xyz;

    # Hide nginx version in response headers for security
    server_tokens off;

    # General API location block - handles all routes except those specifically defined
    location / {
    # Forward requests to Nest.js application running on port 3333
    proxy_pass http://127.0.0.1:3333/;
    # Use HTTP/1.1 for proxy connections
    proxy_http_version 1.1;
    # Required headers for WebSocket connections
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    # Pass the original host header to the backend
    proxy_set_header Host $host;
    # Ensure proxy doesn't serve cached content
    proxy_cache_bypass $http_upgrade;
    # Security headers for proper client IP handling
    # Pass the real visitor's IP address to the backend
    proxy_set_header X-Real-IP $remote_addr;
    # Add forwarded IP addresses chain
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # Pass the original protocol (http/https) to the backend
    proxy_set_header X-Forwarded-Proto $scheme;
    # Security headers to protect against common web vulnerabilities
    # Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;
    # Protect against clickjacking attacks
    add_header X-Frame-Options "SAMEORIGIN" always;
    }

    # Specific location block for handling AI streaming responses using Vercel AI SDK
    location /api/components/generate {
    # Forward requests to the Nest.js application running on localhost port 3333
    proxy_pass http://127.0.0.1:3333;

        # Use HTTP/1.1 protocol which is required for keep-alive connections and streaming
        proxy_http_version 1.1;
        # Set connection header to keep-alive to maintain persistent connections
        proxy_set_header Connection 'keep-alive';

        # Disable Nginx buffering to prevent delays in streaming responses
        # This ensures chunks are sent immediately to the client
        proxy_buffering off;
        # Disable caching of streaming responses
        proxy_cache off;

        # Forward essential headers to the backend application
        # Pass the original hostname to the backend
        proxy_set_header Host $host;
        # Pass the actual client IP address
        proxy_set_header X-Real-IP $remote_addr;
        # Add client IP to X-Forwarded-For header chain
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # Pass the original protocol (http/https) to the backend
        proxy_set_header X-Forwarded-Proto $scheme;

        # Set longer timeouts for streaming connections
        # Maximum time to read response from backend
        proxy_read_timeout 300s;
        # Maximum time to send response to client
        proxy_send_timeout 300s;
    }


    # SSL Configuration
    # Listen on port 443 for SSL connections with HTTP/2 support
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.uibutler.xyz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.uibutler.xyz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

# Redirect server block - handles HTTP requests

server {

# If someone accesses the domain via HTTP

if ($host = api.uibutler.xyz) {

# Redirect them to HTTPS (301 = permanent redirect)

return 301 https://$host$request_uri;
}

# Listen on port 80 (HTTP)

listen 80;
server_name api.uibutler.xyz;

# Return 404 for all other HTTP requests

return 404;
}
