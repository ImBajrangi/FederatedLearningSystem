# Stage 1: Build Frontend (Institutional Dashboard)
FROM node:20-slim AS frontend-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY dashboard/ ./
# Supabase credentials must be available at build time for Vite to inline them
ENV VITE_SUPABASE_URL=https://tilimltxgeucefxzerqi.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGltbHR4Z2V1Y2VmeHplcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjQyNTQsImV4cCI6MjA4MzIwMDI1NH0.lwaCJyTRW6jNsfQJ32R_wAwp11yj6bvsJ4fzC0EX_00
RUN npm run build

# Stage 2: Final Production Image (optimized for free-tier servers)
FROM python:3.10-slim
LABEL maintainer="AI Guardian Team"
LABEL version="2.1.0"
LABEL description="Secure Federated Learning Infrastructure"

WORKDIR /app

# Install only critical system deps, clean aggressively for smaller image
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Optimize layer caching: Install core requirements first
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    find /usr/local -name '*.pyc' -delete && \
    find /usr/local -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true

# Copy backend architecture (selective — no tests, no docs, no data)
COPY Cybronites/ ./Cybronites/
COPY blockchain/ ./blockchain/
COPY security/ ./security/
COPY utils/ ./utils/
COPY core/ ./core/
COPY run_local.py ./

# Import built dashboard from Stage 1
COPY --from=frontend-builder /app/dashboard/dist ./dist

# Exposed Ports: Dashboard (7860) & FL Orchestrator (8095)
EXPOSE 7860 8095

# Set up user for Hugging Face (UID 1000) — also works on Railway, Render, Fly
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH \
	SUPABASE_URL=https://tilimltxgeucefxzerqi.supabase.co \
	SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGltbHR4Z2V1Y2VmeHplcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjQyNTQsImV4cCI6MjA4MzIwMDI1NH0.lwaCJyTRW6jNsfQJ32R_wAwp11yj6bvsJ4fzC0EX_00 \
	PYTHONUNBUFFERED=1 \
	PYTHONDONTWRITEBYTECODE=1 \
	OMP_NUM_THREADS=2 \
	MKL_NUM_THREADS=2

WORKDIR $HOME/app

COPY --chown=user . $HOME/app
COPY --chown=user --from=frontend-builder /app/dashboard/dist $HOME/app/dist

RUN chmod +x start.sh

# Health check for platforms that support it (Railway, Render, Fly)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-7860}/api/health || exit 1

# Entrypoint via the unified Guardian Startup Hub
ENTRYPOINT ["./start.sh"]
