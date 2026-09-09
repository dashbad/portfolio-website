# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage — compile the Astro static site.
# Astro 7 requires Node >= 22.12, so node:22-alpine is used rather than Node 20.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Media is excluded from the build context via .dockerignore, so nothing heavy
# is copied here.
COPY . .
RUN npm run build


# ---------------------------------------------------------------------------
# Production stage — Caddy serves dist/, media comes from an external mount.
# ---------------------------------------------------------------------------
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy

# Mount point for host media (bind-mounted at runtime, never baked in).
RUN mkdir -p /usr/share/caddy/media

EXPOSE 80
