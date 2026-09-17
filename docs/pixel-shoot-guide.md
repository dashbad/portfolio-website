# Shooting the LED pieces on a Pixel 10 Pro XL

One setup per piece gives you the hero loop, the poster and the gallery stills.
Work through the sections in order. The Fixture and Room sections matter more
than any camera setting.

---

## 1. Kit

- Pixel 10 Pro XL, battery above 50 %, at least 10 GB free
- Phone tripod with a clamp mount, set to the fixture's height
- Microfibre cloth
- Dark cloth or sheet for behind the piece (optional but worth it)
- One small dim lamp, neutral or cool, for a touch of fill (optional)
- The fixture's controller app open, so you can dim it and pick an animation

## 2. Fixture

- **Brightness: 25 to 35 %.** Full brightness turns the LEDs white on camera.
  Dimmed, the colour comes back and the diffusers stop glowing flat.
- **Animation: slow and saturated.** Avoid fast strobes and palettes with a lot
  of white. Deep colours moving gently look best and compress cleanly.
- **Fixed period if you can.** A demo mode that repeats exactly every 8 seconds
  (or any known length) gives a perfect loop with no editing tricks.
- Let it run for a minute before shooting so the brightness settles.

## 3. Room

- **Every other light off.** The fixture is the only light source.
- **Shoot at night** or with blinds closed. No daylight, no ceiling light, no TV.
- **Background:** dark cloth behind the piece, or move it at least a metre away
  from any wall so the wall falls to black. Clear shelves, frames and cables out
  of the frame edges.
- **Fill (optional):** if the physical form disappears into black, add one dim
  lamp bounced off the ceiling or a far wall, as low as it will go. Cool or
  neutral, never a warm tungsten bulb.
- **Reflections:** check glossy surfaces near the piece for the phone's own
  screen reflection. Turn the screen brightness down.

## 4. Camera prep

- Clean the lens with the microfibre cloth. Do this before every piece.
- Mount the phone on the tripod, landscape, main (1x) lens only.
  No ultrawide, no 2x crop.
- Frame the piece with a little breathing room on all sides. The site crops the
  hero to 21:9, so keep the piece in the middle third with dark space either
  side. Do not let the piece touch the frame edges.
- Level the phone so straight edges on the piece stay straight.

## 5. Video settings (Pixel Camera app)

Open the camera, swipe to **Video**, tap the settings gear.

| Setting | Value |
|---|---|
| Resolution | 4K |
| Frame rate | 30 fps (not 60, not slow motion) |
| 10-bit HDR video | **Off** |
| Video Boost | On |
| Stabilisation | Standard |
| Lens | 1x |
| Audio | Doesn't matter, the script strips it |

Then on the live view:

1. Tap and hold on the fixture until the exposure/focus lock appears.
2. Drag the **brightness** slider down until the brightest LEDs keep their
   colour and nothing is pure white. Usually two or three notches below centre.
3. Set **white balance** to a fixed value, not Auto. Pick one preset or Kelvin
   value (around 4500 K if offered) and use the same one for every piece.
4. Record 30 to 40 seconds without touching the phone or the tripod.
5. Review at full screen. Look for flicker, pulsing brightness or a wobble.
   If the LEDs show rolling bands, dim the fixture a little and record again.

**Full manual alternative:** the free Blackmagic Camera app gives real manual
video control. Use 4K, 30 fps, shutter 1/60, ISO 100 to 400, white balance
4500 K, H.264 or H.265, HDR/log off.

## 6. Photo settings (Pixel Camera app)

Without moving anything, swipe to **Photo**, tap the settings gear, open **Pro**.

| Setting | Value |
|---|---|
| Pro controls | Manual |
| Resolution | 50 MP |
| Format | RAW + JPEG |
| Ultra HDR | Off |
| Night Sight | Off (tap the moon icon if it appears) |
| Lens | 1x |
| ISO | 100 (the minimum of 42 is one and a half stops too dark) |
| Shutter | 1/30 for the first frame, then 1/15 and 1/8 |
| White balance | Same fixed value as the video |
| Focus | Manual, on the front face of the piece |

Judge exposure on the phone screen at full brightness: the brightest cells
should be just short of pure white and the piece should look as bright as it
does in the room. If it looks dim on screen it is underexposed. Take three
frames at 1/30, 1/15 and 1/8 with ISO 100, and pick the brightest one that
keeps colour in the hottest cells. Use the timer or volume button so pressing
the screen doesn't shake the phone.

RAW is switched on, so a frame that is a little dark is recoverable: the DNG
takes a push of one and a half stops in Google Photos or Lightroom without
visible noise, and even the JPEG takes about one stop (see section 8).

Then, handheld, take a few gallery shots: details, the mounting, the piece in
its room. Keep Pro mode and the same white balance.

## 7. Per-piece checklist

```
[ ] Fixture at 25–35 %, slow saturated animation (fixed period if possible)
[ ] Room dark, background clear or covered, fill lamp dim and cool
[ ] Lens cleaned
[ ] Tripod level at fixture height, landscape, 1x, breathing room in frame
[ ] Video: 4K 30, HDR off, Boost on, exposure locked and pulled down, WB fixed
[ ] 30–40 s recorded, reviewed for flicker and wobble
[ ] Photo: Pro, 50 MP, RAW+JPEG, ISO 100, same WB, 1/30 + 1/15 + 1/8
[ ] Handheld gallery shots
```

Pieces: comb-jelly, fibre-triangles, geodesic-dome, paragami-led.

## 8. Processing on the Mac

Copy the files off the phone, then from the repo root:

```bash
# Hero loop + poster. --duration is the animation period; --start skips the
# first few seconds while the phone settled.
scripts/hero-media.sh loop ~/Downloads/PXL_xxx.mp4 geodesic-dome --start 4 --duration 8 --aspect 21:9

# If the period isn't exact, cross-fade the end into the start instead.
scripts/hero-media.sh loop ~/Downloads/PXL_xxx.mp4 comb-jelly --start 4 --duration 10 --xfade 0.8 --aspect 21:9

# Gallery stills, one per file.
scripts/hero-media.sh photo ~/Downloads/PXL_yyy.jpg public/media/art/geodesic-dome/mounted-1.jpg

# A still that came out too dark: brighten it by 1.3 stops while resizing.
scripts/hero-media.sh photo ~/Downloads/PXL_yyy.jpg public/media/art/geodesic-dome/mounted-1.jpg --push 1.3
```

The loop command writes `hero-loop.mp4` and `poster.jpg` into
`public/media/art/<slug>/`, which is what the site already references. Check the
result in `astro dev`, then copy the folder to `host-media/` on the server.

## 9. Common problems

| Symptom | Fix |
|---|---|
| LEDs are white instead of coloured | Dim the fixture, pull exposure down further |
| Whole photo dark, piece looks dim | ISO or shutter too low. ISO 100 at 1/30 is the floor; push the DNG +1 to +1.5 EV, or use `--push` |
| Orange or muddy background | A warm light is still on somewhere; find it |
| Colours drift during the clip | White balance was on Auto; fix it |
| Rolling bands or flicker | Dim the fixture; use a slower shutter (1/30 to 1/60) |
| Haze or halos around LEDs | Clean the lens |
| Loop jumps at the seam | Use `--duration` equal to the period, or add `--xfade 0.8` |
| Piece looks flat and cut out | Add a very dim, cool fill light |
| Video looks different in the browser | 10-bit HDR was on; turn it off and reshoot |
