## Session 1 — 2026-09-14

**Strategy:** Single continuous interview take (host + Mestre Rangel Faria, ~2m28s),
no retakes/errors to choose between. Tightened only the handful of pauses >1s
between speaker turns (breath/handoff gaps), kept the closing handshake +
"Oss / Valeu, tadinho / Obrigado" as the organic outro. No color grade. Burned-in
natural-sentence Portuguese subtitles (4-7 word chunks, original casing/
punctuation, not the 2-word UPPERCASE bold-overlay default). Appended
`vinheta encerramento horizontal.mp4` as the final segment. Delivered at native
4K (3840x2160) instead of the render.py default 1080p downscale, since both
source and vignette are already 4K.

**Decisions:**
- 5 internal cuts in the interview (all ≥1s gaps trimmed to ~300ms, word-boundary
  padded 150ms/side): 7.86-9.00s, 11.86-12.92s, 71.60-73.28s, 102.00-103.14s,
  114.18-115.78s. Did NOT trim the 145.68-147.14s gap — that's the on-camera
  handshake action, not dead air.
- Vignette appended as a sequential EDL range (source "vinheta"), not an overlay.
- Wrote a custom render wrapper (`render_native.py` / `finish_render.py` in the
  session scratchpad, not committed to the shared skill) to: keep native
  resolution instead of render.py's hardcoded 1920px scale, force stereo
  (`-ac 2`) on every segment so the mono interview and stereo vignette audio
  concat cleanly, and use a 2x-scaled subtitle force_style (FontSize 36,
  Outline 3, MarginV 140) since the shipped style was tuned for 1080p.
- Wrote a custom natural-sentence SRT builder (`build_srt_natural.py`) instead
  of the shipped 2-word/UPPERCASE `build_master_srt` — 4-7 word chunks,
  breaking on punctuation or ≥0.35s gaps, original casing preserved.

**Reasoning log:**
- Interview transcript showed no retakes, mistakes, or wasted pre/post-interview
  footage — the raw file already starts and ends on interview content, so the
  edit is a light tightening pass, not a multi-take selection.
- `ffmpeg`'s `subtitles` filter on Windows resolves the srt path via a codepage-
  sensitive fopen; any accented character in the path (the user's own
  `Ágata Bressan` profile folder) breaks it, and `Path.resolve()` un-helpfully
  converts an 8.3 short name (`GATABR~1`) back to the long accented form. Fix:
  copy the .srt to an ASCII-only path outside the user profile (`C:\vid_tmp\`)
  and composite subtitles without calling `.resolve()` on that path.

**Outstanding:**
- `edit/base.mp4` and `edit/clips_graded/*.mp4` (uncut 4K intermediates, ~1.7GB)
  are still on disk for quick re-cuts without re-extracting. Safe to delete once
  the final cut is approved.
- Only one interview transcribed/edited so far (Rangel Farias). More raw
  interviews are expected to land in the project root per CLAUDE.md.

## Session 2 — 2026-09-15

**Strategy:** Revision pass on session 1's cut per user feedback: same EDL
(same 6 cuts + vignette), but (1) added the `neutral_punch` color grade,
(2) added gentle denoise to the interview audio, (3) dropped subtitles
entirely for this delivery (destination is YouTube, which has its own
caption system).

**Decisions:**
- Grade: `eq=contrast=1.06:brightness=0.0:saturation=1.0,curves=master='0/0
  0.25/0.23 0.75/0.77 1/1'` (video-use's `neutral_punch` preset) applied
  per-segment at extraction time.
- Denoise: `highpass=f=80,afftdn=nr=15:nf=-25` on the interview mic track
  only (before the 30ms fades), skipped on the vignette segment so its music
  bed isn't run through a speech denoiser.
- Subtitles skipped (EDL `subtitles: null`) — no burned-in captions this
  round.
- Replaced `editados/entrevista lmc 2 rangel farias - editado.mp4` in place
  (no versioned filename) since this is a correction, not an alternate cut.

**Reasoning log:**
- Persisted durable preferences to Claude's cross-session memory (not just
  this file) since they apply to *future* interviews from this shoot, not
  just this one: subtitle style (small, lower-third, no burn-in for
  YouTube) and grade/denoise-by-default. See memory files
  `feedback_subtitle_style.md` and `feedback_grade_audio_defaults.md`.

**Outstanding:**
- If a future interview needs burned-in subtitles, do NOT reuse session 1's
  2x-scaled force_style — it was rejected as too large/too high. Build a
  smaller, lower-third style and confirm against a sample frame first.
- `edit/base.mp4` and `clips_graded/` now hold the *graded+denoised* segments
  (session 1's ungraded intermediates were overwritten).

## Session 3 — 2026-09-15

**Strategy:** Two corrections on session 2's cut:
1. Opening cut started at raw t=0 (~1.8s of both people silently posed before
   the first word). User wanted it trimmed to start right as the interviewer
   begins talking. Moved seg 0's start from 0.000 to 1.580 (first word
   "Mestre" starts at 1.78s; left ~200ms buffer).
2. Session 2's denoise (`afftdn=nr=15:nf=-25`) was rejected — user said it
   made the audio sound like "talking inside a bathroom" (classic
   over-aggressive spectral-subtraction artifact from pushing `nf` well
   above its default). Backed off to `afftdn=nr=8` with no `nf` override
   (afftdn's own conservative -50dB default), highpass unchanged at 80Hz.

**Decisions:**
- New total duration: ~145.08s (was 146.68s).
- Same grade (`neutral_punch`), still no subtitles (YouTube delivery).
- Replaced `editados/entrevista lmc 2 rangel farias - editado.mp4` in place
  again.
- Recorded the denoise-artifact lesson and the opening-cut-timing preference
  to cross-session memory (`feedback_grade_audio_defaults.md`,
  `feedback_cut_timing.md`) since both apply to every future interview from
  this shoot, not just this file.

**Outstanding:**
- Have not re-listened myself (no audio playback available) — if `nr=8`
  still isn't enough noise reduction or still sounds off, next step is to
  raise `nr` in small increments (10, then 12) rather than touching `nf`
  again, per the memory note.

## Session 4 — 2026-09-17

**Strategy:** First edit of a second interview (Sthanley "o Máscara"), applying
all lessons from the Rangel Farias sessions as the starting baseline instead
of relearning them: `neutral_punch` grade, `afftdn=nr=8` denoise (no `nf`
override), no burned-in subtitles (YouTube delivery), vignette appended,
native 4K output, forced stereo on every segment for clean concat with the
vignette.

**Decisions:**
- Single continuous take, ~90.2s raw, already tight on both ends (first
  frame is mid-laugh, last frame is the closing gesture) — no pre/post-roll
  trim needed, unlike Rangel's opening.
- One internal cut: removed a false start ("Agor--", 52.04-52.44s) and its
  self-correction pause, splicing directly from "cara?" (ends 51.52s, cut
  at 51.60s w/ 80ms pad) to "essa sim é a nossa igreja, LMC." (starts
  52.94s, cut at 52.86s w/ 80ms pad). Confirmed via `timeline_view` that
  both the pre- and post-cut frames are mid-shot with no visual
  discontinuity.
- render.py wasn't used directly (still hardcodes a 1080p scale and doesn't
  force stereo/denoise) — extracted the 2 interview segments + vignette
  with standalone ffmpeg commands mirroring render.py's per-segment
  approach (grade + 30ms fades + native 3840x2160 + forced `-ac 2`/`-ar
  48000`), then lossless `-c copy` concat. Final duration 90.6s.
- Self-eval via `timeline_view` on both cut boundaries in the *rendered*
  output (not source) — no audio pops, no visual jumps. Passed on first
  pass.
- Delivered to `EDITADOS/entrevista sthanley o maskara - editado.mp4`.

**Reasoning log:**
- Elapsed wall-clock time for this edit (transcription → final render,
  continuous active work, no idle gaps): ~18m27s (13:33:12 → 13:51:39).
  First time this has been measured cleanly — Rangel's sessions spanned
  multiple days with breaks, so no comparable number exists for it. Logged
  in the public README as a portfolio data point.

**Outstanding:**
- render.py's 1080p-scale-by-default and lack of stereo-forcing/denoise
  support means every future interview needs the same manual ffmpeg
  extraction instead of the shipped helper, until/unless render.py itself
  is patched to support a native-resolution + forced-channel-count mode.
- User still needs to validate this cut before it's considered final
  (parallel to the Rangel workflow: validate → YouTube → Drive).
