# Hispaniola — Narrated Video

Turns the `Hispaniola.pptx` deck into a narrated, YouTube-ready MP4 (1920×1080, 30 fps)
using offline neural text-to-speech and Remotion.

## Pipeline

1. **Slides → images.** LibreOffice (Impress) converts the `.pptx` to PDF, then PyMuPDF
   rasterizes each page to a 1920×1080 PNG (`video/slides/`).
2. **Narration script.** `narration.json` holds the voiceover for all 22 slides. It is
   written from the on-slide text and the deck's speaker notes — the notes themselves are
   the author's editorial directions, not read-aloud copy, so the VO was authored fresh and
   fact-checked (see `SOURCES.md`).
3. **TTS.** [Piper](https://github.com/rhasspy/piper) with the `en-US-ryan-high` voice
   synthesizes one WAV per slide (`video/audio/`). Durations are measured so each slide is
   on screen exactly as long as its narration.
4. **Subtitles + timing.** `build_manifest.py` splits each slide's narration into caption
   cues, times them proportionally, and writes `remotion/src/manifest.json`.
5. **Video.** Remotion (`remotion/src/Slideshow.tsx`) sequences each slide with a slow
   Ken Burns move, gentle fades, burned-in animated subtitles, a bottom scrim for
   legibility, and a gold progress bar, then renders `remotion/out/hispaniola.mp4`.

## Reproduce

```bash
# system deps: libreoffice-impress, python3 (pymupdf, python-pptx, piper-tts, pillow)
# 1. slides
soffice --headless --convert-to pdf --outdir /tmp Hispaniola.pptx
python3 pdf2png.py            # PDF -> video/slides/*.png

# 2. narration audio  (voice model in video/voices/)
python3 tts.py               # narration.json -> video/audio/*.wav

# 3. manifest + render
python3 build_manifest.py
cd remotion && npm install && npx remotion render Hispaniola out/hispaniola.mp4
```

## Engaging features in the video
- Animated, sentence-synced **subtitles** (improves retention and accessibility).
- Slow **Ken Burns** zoom, alternating direction per slide.
- Smooth **fades** between slides on the deck's own dark palette.
- **Progress bar** so viewers can track position.
- Pacing locked to the narration so nothing is rushed or cut off.

## Notes / limits
- The voice is open-source neural TTS (Piper). Swapping in a cloud voice (e.g. a more
  expressive narrator) only requires regenerating `video/audio/` and the manifest.
- The 120 MB Piper voice model and `node_modules` are git-ignored; the voice config JSON
  is kept so the model can be re-downloaded from the Piper GitHub release.
