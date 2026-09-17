#!/usr/bin/env bash
#
# hero-media.sh — turn raw Pixel footage into the site's hero loop + poster,
# and raw Pixel photos into web-sized gallery stills.
#
#   scripts/hero-media.sh loop  <clip.mp4> <slug> [options]
#   scripts/hero-media.sh photo <photo.jpg> <out.jpg> [options]
#
# LOOP writes into public/media/art/<slug>/:
#   hero-loop.mp4   H.264, yuv420p, faststart, silent   (what VideoPlayer plays)
#   hero-loop.webm  VP9 (only with --webm; the player does not use it yet)
#   poster.jpg      the exact first frame of hero-loop.mp4, same crop and size
#   tile.jpg        4:3 still of the same frame, 1600 wide, for the art index tile
#
# Loop options:
#   --start SEC      trim in-point in the source clip            (default 0)
#   --duration SEC   loop length; ideally the animation's period (default: rest of clip)
#   --xfade SEC      cross-fade the tail into the head for a seamless loop when the
#                    period is not exact. 0.5–1.0 s is plenty.  (default 0 = off)
#   --aspect W:H     centre-crop to this aspect, e.g. 21:9      (default: keep source)
#   --zoom N         centre-crop to 1/N of the frame first, e.g. 1.4 to tighten a
#                    wide 4K shot without moving the tripod      (default 1)
#   --shift X:Y      move the crop window by fractions of the frame, e.g. 0.03:-0.04
#                    nudges it right and up. Needs --zoom or --aspect for room.
#   --rotate DEG     straighten: positive turns the image anticlockwise (default 0)
#   --width PX       max output width, never upscaled           (default 1920)
#   --fps N          output frame rate                           (default 30)
#   --crf N          x264 quality, lower = bigger/better         (default 21)
#   --push EV        brighten the whole clip by EV stops         (default 0)
#   --webm           also encode a VP9 .webm
#   --out DIR        output directory      (default public/media/art/<slug>)
#   --dry-run        print the ffmpeg commands without running them
#
# PHOTO options:
#   --width PX       max width, never upscaled                   (default 2000)
#   --quality N      JPEG quality 1 (best) – 31                  (default 3)
#   --push EV        brighten by EV stops, e.g. 1.3 for a shot that
#                    came out dark (negative darkens)             (default 0)
#   --rotate DEG     straighten: positive turns the image anticlockwise; the
#                    black corners are trimmed automatically      (default 0)
#
# Shoot in SDR (10-bit HDR video OFF on the Pixel). If an HDR clip is given the
# script tone-maps it to SDR when this ffmpeg has the zscale filter, and refuses
# with an explanation when it does not.
#
# Examples:
#   scripts/hero-media.sh loop ~/Downloads/PXL_20260920_203000.mp4 geodesic-dome \
#       --start 4 --duration 8 --aspect 21:9
#   scripts/hero-media.sh loop clip.mp4 comb-jelly --duration 10 --xfade 0.8 --webm
#   scripts/hero-media.sh photo ~/Downloads/PXL_20260920_203100.jpg \
#       public/media/art/geodesic-dome/build-1.jpg
#
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die()  { printf 'error: %s\n' "$*" >&2; exit 1; }
info() { printf '\033[1;36m▸\033[0m %s\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || die "$1 is not installed (brew install ffmpeg)"; }

need ffmpeg
need ffprobe

usage() { sed -n '2,/^set -euo/p' "${BASH_SOURCE[0]}" | sed '$d' | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# Scale so the width never exceeds $1 and both dimensions stay even.
scale_expr() { printf "scale=w='trunc(min(iw,%s)/2)*2':h=-2" "$1"; }

# ---------------------------------------------------------------------------
# loop
# ---------------------------------------------------------------------------
cmd_loop() {
  [[ $# -ge 2 ]] || usage 1
  local in="$1" slug="$2"; shift 2
  [[ -f "$in" ]] || die "no such file: $in"

  local start=0 duration="" xfade=0 aspect="" zoom=1 width=1920 fps=30 crf=21 push=0
  local shift="0:0" rotate=0
  local webm=0 out="" dry=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --start)    start="$2";    shift 2 ;;
      --duration) duration="$2"; shift 2 ;;
      --xfade)    xfade="$2";    shift 2 ;;
      --aspect)   aspect="$2";   shift 2 ;;
      --zoom)     zoom="$2";     shift 2 ;;
      --shift)    shift="$2";    shift 2 ;;
      --rotate)   rotate="$2";   shift 2 ;;
      --width)    width="$2";    shift 2 ;;
      --fps)      fps="$2";      shift 2 ;;
      --crf)      crf="$2";      shift 2 ;;
      --push)     push="$2";     shift 2 ;;
      --webm)     webm=1;        shift ;;
      --out)      out="$2";      shift 2 ;;
      --dry-run)  dry=1;         shift ;;
      -h|--help)  usage ;;
      *) die "unknown option: $1" ;;
    esac
  done
  out="${out:-$here/public/media/art/$slug}"

  # --- probe the source ---------------------------------------------------
  local probe transfer primaries src_dur
  probe="$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=color_transfer,color_primaries:format=duration \
    -of default=nw=1 "$in")"
  transfer="$(sed -n 's/^color_transfer=//p'  <<<"$probe")"
  primaries="$(sed -n 's/^color_primaries=//p' <<<"$probe")"
  src_dur="$(sed -n 's/^duration=//p'          <<<"$probe")"
  [[ -n "$src_dur" ]] || die "could not read the clip's duration"

  if [[ -z "$duration" ]]; then
    duration="$(awk -v d="$src_dur" -v s="$start" 'BEGIN{printf "%.3f", d - s}')"
  fi
  awk -v d="$duration" 'BEGIN{exit !(d > 0)}' || die "duration must be positive (clip is ${src_dur}s, start is ${start}s)"
  if (( $(awk -v x="$xfade" -v d="$duration" 'BEGIN{print (x*2 >= d)}') )); then
    die "--xfade ($xfade s) must be less than half the loop length ($duration s)"
  fi

  # --- filter chain -------------------------------------------------------
  local vf=""
  local hdr=0
  case "$transfer" in smpte2084|arib-std-b67) hdr=1 ;; esac
  [[ "$primaries" == "bt2020" ]] && hdr=1
  if (( hdr )); then
    if ffmpeg -hide_banner -filters 2>/dev/null | grep -q ' zscale '; then
      info "HDR source ($transfer / $primaries): tone-mapping to SDR bt709"
      vf+="zscale=t=linear:npl=1000,format=gbrpf32le,zscale=p=bt709,"
      vf+="tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,"
    else
      die "this clip is HDR ($transfer / $primaries) but this ffmpeg lacks the zscale filter.
       Either re-shoot with '10-bit HDR video' switched off in the Pixel camera
       settings (recommended: what you see is what the browser gets), or install an
       ffmpeg built with zimg (brew reinstall ffmpeg, or a full build)."
    fi
  fi
  if [[ "$push" != "0" ]]; then
    vf+="exposure=exposure=${push},"
  fi
  [[ "$shift" =~ ^-?[0-9.]+:-?[0-9.]+$ ]] || die "--shift must look like 0.03:-0.04"
  local sx="${shift%%:*}" sy="${shift##*:}"
  # crop offsets: centred, then nudged by the shift (crop clamps to the frame).
  # The nudge is applied once: in the zoom crop when there is one, else later.
  local off="x='(iw-ow)/2+(${sx})*iw':y='(ih-oh)/2+(${sy})*ih'"
  local off_rest="$off"
  if [[ "$rotate" != "0" ]]; then
    vf+="rotate=-(${rotate})*PI/180:c=black,"
  fi
  if [[ "$zoom" != "1" ]]; then
    awk -v z="$zoom" 'BEGIN{exit !(z >= 1)}' || die "--zoom must be 1 or more"
    vf+="crop=w='trunc(iw/${zoom}/2)*2':h='trunc(ih/${zoom}/2)*2':${off},"
    off_rest="x='(iw-ow)/2':y='(ih-oh)/2'"
  fi
  local pre_aspect="$vf"
  if [[ -n "$aspect" ]]; then
    [[ "$aspect" =~ ^[0-9.]+:[0-9.]+$ ]] || die "--aspect must look like 21:9"
    local aw="${aspect%%:*}" ah="${aspect##*:}"
    # keep the largest window with the requested aspect, centred then nudged
    vf+="crop=w='trunc(min(iw,ih*${aw}/${ah})/2)*2':h='trunc(min(ih,iw*${ah}/${aw})/2)*2':${off_rest},"
  fi
  vf+="$(scale_expr "$width"),fps=${fps},format=yuv420p,setsar=1"

  local graph
  if (( $(awk -v x="$xfade" 'BEGIN{print (x > 0)}') )); then
    # Output = mid ++ (tail ⨯ head). The clip's end fades into its beginning, so
    # the last output frame equals the first and the loop point disappears.
    local f="$xfade" d="$duration"
    graph="[0:v]${vf},split=3[m][t][h];"
    graph+="[m]trim=start=${f}:end=$(awk -v d="$d" -v f="$f" 'BEGIN{printf "%.3f", d-f}'),setpts=PTS-STARTPTS[mid];"
    graph+="[t]trim=start=$(awk -v d="$d" -v f="$f" 'BEGIN{printf "%.3f", d-f}'):end=${d},setpts=PTS-STARTPTS[tail];"
    graph+="[h]trim=start=0:end=${f},setpts=PTS-STARTPTS[head];"
    graph+="[tail][head]xfade=transition=fade:duration=${f}:offset=0[x];"
    graph+="[mid][x]concat=n=2:v=1:a=0[v]"
  else
    graph="[0:v]${vf}[v]"
  fi

  local common=(-hide_banner -loglevel error -stats -y
                -ss "$start" -t "$duration" -i "$in"
                -filter_complex "$graph" -map '[v]' -an -sn -dn -map_metadata -1)
  local gop=$(( fps * 2 ))

  local mp4="$out/hero-loop.mp4" poster="$out/poster.jpg" tile="$out/tile.jpg" webmf="$out/hero-loop.webm"
  # the tile is the same source frame as the poster, cropped 4:3 instead of the hero aspect
  local poster_t; poster_t="$(awk -v s="$start" -v f="$xfade" 'BEGIN{printf "%.3f", s+f}')"
  local enc_tile=(ffmpeg -hide_banner -loglevel error -y -ss "$poster_t" -i "$in" -frames:v 1
    -vf "${pre_aspect}crop=w='trunc(min(iw,ih*4/3)/2)*2':h='trunc(min(ih,iw*3/4)/2)*2':${off_rest},scale=1600:-2,format=yuvj420p"
    -update 1 -q:v 3 -map_metadata -1 "$tile")
  local enc_mp4=(ffmpeg "${common[@]}"
    -c:v libx264 -preset slow -crf "$crf" -profile:v high -level 4.1
    -g "$gop" -keyint_min "$gop" -sc_threshold 0
    -color_primaries bt709 -color_trc bt709 -colorspace bt709
    -movflags +faststart "$mp4")
  local enc_poster=(ffmpeg -hide_banner -loglevel error -y -i "$mp4"
    -frames:v 1 -update 1 -q:v 2 -map_metadata -1 "$poster")
  local enc_webm=(ffmpeg "${common[@]}"
    -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -deadline good -cpu-used 2
    -g "$gop" -pix_fmt yuv420p "$webmf")

  info "source   $in  (${src_dur}s$( (( hdr )) && printf ", HDR" ))"
  info "loop     start=${start}s  duration=${duration}s  xfade=${xfade}s  aspect=${aspect:-source}  zoom=${zoom}  shift=${shift}  rotate=${rotate}°  push=${push}EV  ≤${width}px @ ${fps}fps"
  info "output   $out/"

  if (( dry )); then
    printf '%q ' "${enc_mp4[@]}";    printf '\n\n'
    printf '%q ' "${enc_poster[@]}"; printf '\n\n'
    printf '%q ' "${enc_tile[@]}";   printf '\n'
    (( webm )) && { printf '\n'; printf '%q ' "${enc_webm[@]}"; printf '\n'; }
    return 0
  fi

  mkdir -p "$out"
  info "encoding hero-loop.mp4"
  "${enc_mp4[@]}"
  info "extracting poster.jpg from the first frame"
  "${enc_poster[@]}"
  info "cutting tile.jpg (4:3) from the same frame"
  "${enc_tile[@]}"
  if (( webm )); then
    info "encoding hero-loop.webm (VP9, this is slow)"
    "${enc_webm[@]}"
  fi

  echo
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate,bit_rate:format=duration,size \
    -of default=nw=1 "$mp4" | sed 's/^/  mp4  /'
  ffprobe -v error -show_entries stream=width,height -of default=nw=1 "$poster" | sed 's/^/  poster  /'
  ffprobe -v error -show_entries stream=width,height -of default=nw=1 "$tile" | sed 's/^/  tile    /'
  echo
  info "frontmatter for src/content/art/${slug}.mdx:"
  printf '  heroVideo: /media/art/%s/hero-loop.mp4?v=DATE\n  heroPoster: /media/art/%s/poster.jpg?v=DATE\n  heroTile: /media/art/%s/tile.jpg?v=DATE\n' "$slug" "$slug" "$slug"
  info "bump ?v= whenever a file is replaced under the same name: Caddy caches /media for 7 days"
}

# ---------------------------------------------------------------------------
# photo
# ---------------------------------------------------------------------------
cmd_photo() {
  [[ $# -ge 2 ]] || usage 1
  local in="$1" out="$2"; shift 2
  [[ -f "$in" ]] || die "no such file: $in"
  local width=2000 quality=3 push=0 rotate=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --width)   width="$2";   shift 2 ;;
      --quality) quality="$2"; shift 2 ;;
      --push)    push="$2";    shift 2 ;;
      --rotate)  rotate="$2";  shift 2 ;;
      -h|--help) usage ;;
      *) die "unknown option: $1" ;;
    esac
  done
  mkdir -p "$(dirname "$out")"
  # -map_metadata -1 drops EXIF, GPS and the Ultra HDR gain map so browsers show
  # the same SDR image everywhere. Orientation is applied before it is dropped.
  local vf=""
  if [[ "$rotate" != "0" ]]; then
    # rotate, then trim the wedges the rotation leaves at the edges
    vf+="rotate=-(${rotate})*PI/180:c=black,"
    vf+="crop=w='trunc((iw-ih*abs(sin(${rotate}*PI/180)))/2)*2':h='trunc((ih-iw*abs(sin(${rotate}*PI/180)))/2)*2',"
  fi
  vf+="$(scale_expr "$width")"
  if [[ "$push" != "0" ]]; then
    vf+=",exposure=exposure=${push}"
    info "pushing exposure by ${push} EV"
  fi
  ffmpeg -hide_banner -loglevel error -y -i "$in" \
    -vf "${vf},format=yuvj420p" \
    -frames:v 1 -update 1 -q:v "$quality" -map_metadata -1 "$out"
  info "wrote $out  ($(ffprobe -v error -show_entries stream=width,height -of csv=p=0:s=x "$out"), $(du -h "$out" | cut -f1))"
}

case "${1:-}" in
  loop)  shift; cmd_loop "$@" ;;
  photo) shift; cmd_photo "$@" ;;
  -h|--help|"") usage 0 ;;
  *) die "unknown command: $1 (expected loop or photo)" ;;
esac
