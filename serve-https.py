#!/usr/bin/env python3
"""
HTTPS Server for Drivers Dashboard
Serves the dashboard over HTTPS to avoid mixed content issues with GitHub API
"""

import http.server
import socketserver
import ssl
import os
import sys

class HTTPServer(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def create_self_signed_cert():
    """Create a self-signed certificate for localhost"""
    try:
        import subprocess
        # Try to use mkcert if available
        result = subprocess.run(['mkcert', '-help'], capture_output=True, text=True)
        if result.returncode == 0:
            print("📜 Using mkcert for certificates...")
            os.system('mkcert -install 2>/dev/null')
            os.system('mkcert localhost 2>/dev/null')
            return 'localhost.pem', 'localhost-key.pem'
    except:
        pass

    # Fallback to openssl
    print("🔐 Creating self-signed certificate with openssl...")
    try:
        os.system('openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=SF/O=Dev/CN=localhost" 2>/dev/null')
        return 'cert.pem', 'key.pem'
    except:
        print("❌ Failed to create certificates")
        return None, None

def main():
    port = 8443
    cert_file, key_file = create_self_signed_cert()

    if not cert_file or not key_file or not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("❌ Certificate creation failed")
        print("💡 Try installing mkcert: https://github.com/FiloSottile/mkcert")
        sys.exit(1)

    try:
        with socketserver.TCPServer(('localhost', port), HTTPServer) as httpd:
            # Wrap socket with SSL
            httpd.socket = ssl.wrap_socket(httpd.socket,
                                         keyfile=key_file,
                                         certfile=cert_file,
                                         server_side=True)

            print(f"🔒 HTTPS server running on https://localhost:{port}")
            print("⚠️  You may need to accept the self-signed certificate in your browser")
            print("📋 Open: https://localhost:8443")
            print("🔄 This avoids mixed content issues with GitHub API")
            print("🛑 Press Ctrl+C to stop")

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == '__main__':
    main()



