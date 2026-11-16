# public/media — project media

Hero videos, posters and gallery images live here, using the same folder structure
the site references, e.g.

```
public/media/art/comb-jelly/hero-loop.mp4
public/media/art/comb-jelly/poster.jpg
public/media/art/comb-jelly/bench-01.jpg
```

`astro dev` serves this folder at `/media/...`, and `npm run build` copies it into
`dist/`, so it ships to Firebase Hosting with every deploy. The contents are
git-ignored and only exist on the machine you deploy from: deploying without them
would publish a site whose media all 404s.

Resize photos and strip their EXIF (phone shots include GPS) before adding them:
`scripts/hero-media.sh photo <in.jpg> <out.jpg>`.
