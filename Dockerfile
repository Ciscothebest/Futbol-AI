# =====================================================================
# DOCKERFILE FOR FUTBOLAI FULL-STACK PLATFORM
# Packs Node.js Express backend and static frontend in a single container.
# =====================================================================

# Use full Node.js 22 LTS (Debian GLIBC) to match local development and support GLIBC 2.38+
FROM node:22

# Set environment variables for production
ENV NODE_ENV=production

# Set main working directory
WORKDIR /app

# Copy all backend and frontend source files first
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Wipe out any host node_modules/lockfile and dynamically clean package.json to bypass Linux compilation errors
WORKDIR /app/backend
RUN rm -rf node_modules package-lock.json && \
    node -e " \
      const fs = require('fs'); \
      const pkg = JSON.parse(fs.readFileSync('package.json')); \
      if (pkg.dependencies) delete pkg.dependencies['msnodesqlv8']; \
      if (pkg.optionalDependencies) delete pkg.optionalDependencies['msnodesqlv8']; \
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
    "

# Install fresh, production-ready Linux dependencies (forces sqlite3 to compile natively, bypassing GLIBC mismatches)
RUN npm install --omit=dev --build-from-source=sqlite3 --no-audit --no-fund

# Expose the app port (default is 3001, but will adapt to $PORT env var)
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
