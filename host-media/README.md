# host-media — production media mount

This directory is bind-mounted into the Caddy container at `/usr/share/caddy/media`
(see `docker-compose.yml`). Any request for `/media/<path>` is served from
`host-media/<path>`.

Mirror the structure used in `public/media/` locally, e.g.

```
host-media/art/comb-jelly/hero-loop.mp4
```

Contents are git-ignored and never copied into the Docker image.
