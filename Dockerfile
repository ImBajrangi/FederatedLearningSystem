# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm install
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build Backend & Final Image
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt-cache/lists/*

# Copy backend requirements first for caching
COPY Cybronites/requirements.txt ./requirements_backend.txt
RUN pip install --no-cache-dir -r requirements_backend.txt

# Copy backend code
COPY Cybronites/ ./Cybronites/
# Root utils and blockchain needed for imports
COPY blockchain/ ./blockchain/
COPY security/ ./security/
COPY utils/ ./utils/
COPY core/ ./core/

# Copy built frontend from Stage 1 to the location bridge.py expects it
COPY --from=frontend-builder /app/dashboard/dist ./dist

# Create a startup script
COPY start.sh ./
RUN chmod +x start.sh

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=7860

# Hugging Face Spaces use port 7860 by default
EXPOSE 7860

# Use a startup script to run multi-process (Server + Clients)
CMD ["./start.sh"]
