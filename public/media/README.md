# public/media — local authoring only

Drop hero videos, posters and gallery images here while working locally, using the
same folder structure the site references, e.g.

```
public/media/art/comb-jelly/hero-loop.mp4
public/media/art/comb-jelly/poster.jpg
public/media/art/comb-jelly/bench-01.jpg
```

`astro dev` serves this folder at `/media/...`. The contents are git-ignored and
excluded from the Docker build context (see `.dockerignore`). In production the same
paths are served from the `host-media/` volume mount instead.
