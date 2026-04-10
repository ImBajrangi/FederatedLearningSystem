# Stage 1: Build Frontend (Institutional Dashboard)
FROM node:20-slim AS frontend-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
# Use --legacy-peer-deps for complex institutional dependency trees
RUN npm install
COPY dashboard/ ./
# Supabase credentials must be available at build time for Vite to inline them
ENV VITE_SUPABASE_URL=https://tilimltxgeucefxzerqi.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGltbHR4Z2V1Y2VmeHplcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjQyNTQsImV4cCI6MjA4MzIwMDI1NH0.lwaCJyTRW6jNsfQJ32R_wAwp11yj6bvsJ4fzC0EX_00
RUN npm run build

# Stage 2: Final Production Image
FROM python:3.10-slim
LABEL maintainer="AI Guardian Team"
LABEL version="2.0.0"
LABEL description="Secure Federated Learning Infrastructure"

WORKDIR /app

# Install critical system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Optimize layer caching: Install core requirements first
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend architecture
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

# Set up user for Hugging Face (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH \
	SUPABASE_URL=https://tilimltxgeucefxzerqi.supabase.co \
	SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGltbHR4Z2V1Y2VmeHplcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjQyNTQsImV4cCI6MjA4MzIwMDI1NH0.lwaCJyTRW6jNsfQJ32R_wAwp11yj6bvsJ4fzC0EX_00

WORKDIR $HOME/app

COPY --chown=user . $HOME/app
COPY --chown=user --from=frontend-builder /app/dashboard/dist $HOME/app/dist

RUN chmod +x start.sh

# Entrypoint via the unified Guardian Startup Hub
ENTRYPOINT ["./start.sh"]
