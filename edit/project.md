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

## Session 5 — 2026-09-17 (correction pass)

**Strategy:** Two corrections from user validation feedback on session 4's cut:
1. Opening still had ~3s of dead air before the first spoken word — the cut
   started at the first audio *event* ([risos], 0.52-3.4s) instead of the
   first spoken *word* ("É", starts 3.52s). Moved start to 3.320s (~200ms
   pad before "É").
2. `neutral_punch` at default saturation (1.0) oversaturated the venue's
   pink branding/lighting into red. Dropped saturation to 0.85.

**Decisions:**
- Re-extracted both interview segments (start point only changed on
  segment 1; segment 2 unchanged in timing, both re-graded) with
  `saturation=0.85`. Vignette segment reused as-is (no grade applied to
  it, unaffected).
- New total duration: ~87.3s (was ~90.6s).
- Replaced `EDITADOS/entrevista sthanley o maskara - editado.mp4` in
  place.
- Logged both fixes as new defaults in `CLAUDE.md`'s lessons section
  (saturation 0.85, and "anchor opening cut to first spoken word, not
  first audio event") so future interviews start from the corrected
  baseline instead of repeating them.

**Reasoning log:**
- Correction pass timed separately and added to the session total in the
  public README per user request: ~19min (16:14:56 → 16:33:56), on top of
  the ~18min27s initial cut, for a ~37min total on this interview. Going
  forward, any post-validation adjustment time gets added to that
  interview's reported total, not tracked as a separate/hidden cost.

**Outstanding:**
- Still awaiting final user validation of v2 before YouTube upload.

## Session 6 — 2026-09-17 (publication)

**Strategy:** Validated cut published to the LMC YouTube channel, with
metadata corrections caught during copy review before publishing.

**Decisions:**
- Rewrote `upload.js` to take a `metadata.json` file instead of positional
  CLI args (title/description/tags/categoryId/privacyStatus) — avoids
  shell-escaping issues with accents, quotes, hashtags, and emoji.
- Copy corrections applied before publishing: "ringue" → "cage" (LMC
  fights in a cage, not a ring); interviewee's name spelled "Sthanley 'O
  Maskara'" (validated with the athlete, not the accented "Máscara");
  dropped the social-links/WhatsApp/contact signature block from the
  description since the channel already auto-appends it on every upload;
  added SEO tags covering "Liga Monstro Combate"/"LMC"/"LMC 2" variants.
- The interviewer misspoke the opponent's name on camera ("Brunão")— the
  actual opponent is Felipe Freitas. Did not re-cut the video for a verbal
  slip; instead added a "📝 Errata" note in the YouTube description
  correcting it. Precedent: on-camera verbal errors that don't affect
  editing (no retake available anyway) get corrected in the description,
  not fixed by re-editing.
- Published as `public`, confirmed channel via `channels.list`/`videos.list`
  before and after (`LMC | Liga Monstro Combate`, matching the Rangel
  video's channel).
- End screens (subscribe + link to Sthanley's fight video) are NOT
  supported by the public YouTube Data API — flagged to the user as a
  manual post-upload step in YouTube Studio.
- All of the above (cage/ringue, name spelling, signature block, errata
  convention, end-screen API limitation) logged to `CLAUDE.md` as durable
  defaults for every future interview.

**Reasoning log:**
- Confirmed final title/description/tags with the user before publishing
  despite already having a general "pode subir" go-ahead, because the
  copy had just gone through multiple corrections — worth one more check
  given the video was about to go public and permanent-ish (YouTube).

**Outstanding:**
- User to add the end-screen (subscribe + fight video link) manually in
  YouTube Studio — need the URL/title of Sthanley's fight video once it's
  identified.
- Final step of the pipeline (save to LMC Drive) still pending for this
  interview.

## Session 7 — 2026-09-17 (signature correction)

**Strategy:** Fixed a wrong assumption from session 6 about the channel's
default description signature.

**Decisions:**
- Session 6 assumed the social-links/WhatsApp/contact signature block
  auto-appends to every upload at the YouTube server level, so it was
  deliberately left out of the API description. That assumption was
  wrong: it's a YouTube Studio web-upload-form convenience (pre-fills the
  description box when uploading through the Studio UI), not something
  the API applies. It never appeared on the API-published video.
- User manually pasted the signature into the video in Studio around the
  same time an API `videos.update` call was also adding it — result was
  a duplicated signature block. Fixed by keeping only the first occurrence.
- `videos.update` required a new scope (`youtube.force-ssl`) not covered
  by `youtube.upload`/`youtube.readonly` — added to `auth.js`, required
  one more re-auth.
- New standing rule (in `CLAUDE.md`): always include the signature block
  explicitly in every description sent via the API — never rely on it
  auto-appearing, and don't paste it manually in Studio afterward (avoids
  duplication).

**Reasoning log:**
- Don't assert an unverified mechanism as fact to the user — the first
  explanation offered (delayed auto-apply) was a guess presented too
  confidently; the user's correction (manual paste, timing coincidence)
  was the real explanation.

## Session 8 — 2026-09-17 (Evangelista Cyborg — first edit)

**Strategy:** New raw interview (Evangelista Cyborg, a coach/former
fighter talking about both competing and training athletes for LMC 2),
downloaded from a Google Drive link the user provided (not the local
folder) — ~1.8GB `DJI_20260827154811_0685_D.MP4`, renamed to
`entrevista lmc 2 evangelista cyborg.MP4` per the project's naming
convention. Applied all accumulated lessons from the start instead of
learning them again: saturation 0.85, first-spoken-word opening anchor,
denoise nr=8/no nf, no burned-in subtitles (YouTube).

**Decisions:**
- Downloaded via direct curl against
  `https://drive.usercontent.google.com/download?id=...&export=download&confirm=t`
  rather than the Drive MCP connector's `download_file_content` (which
  returns base64 in-context — completely impractical for a multi-GB
  video). Direct curl streams straight to disk.
- Single continuous take, ~2m05s raw. Two cuts: (1) opening false start
  ("É isso, a se--" + a laugh) removed, cut starts at the clean restart
  "É isso sim, monstruosos..." (5.92s, skipping both the flub and the
  reaction laugh, per the Sthanley-session rule); (2) a tiny
  self-corrected false start near the end ("...mundo a-- pelo mundo
  todo") trimmed for consistency even though barely perceptible (~240ms).
  Tail trimmed ~100ms after the closing "Oss."
- Reused the already-normalized vignette segment
  (`clips_graded/sth_seg_vinheta.mp4`) instead of re-rendering it — same
  target spec (60000/1001 fps, 48kHz stereo), so no need to regenerate
  per interview.
- Self-eval passed on the first pass (no re-render needed) — final
  duration 120.0s. Delivered to
  `EDITADOS/entrevista lmc 2 evangelista cyborg - editado.mp4`.

**Reasoning log:**
- Elapsed time, transcription → final render: ~18min57s (18:15:30 →
  18:34:27). Comparable to the Sthanley interview's initial cut (~18min),
  suggesting ~18-19min is the steady-state time for a single-take
  interview of this length once the lessons don't need rediscovering.

**Outstanding:**
- Awaiting user validation before YouTube upload.

## Session 9 — 2026-09-17 (correction pass — grade)

**Strategy:** User validation feedback: color looked "apagada"/washed out on
this cut, but flagged uncertainty about whether the standing saturation=0.85
instruction was even the right call for this footage — a good instinct,
and correct.

**Decisions:**
- Compared a raw frame against the graded one: this shoot's lighting was
  already much less saturated/punchy than the Sthanley shoot (dimmer,
  grayer greens), so subtracting another 15% saturation on top of already
  muted footage read as flat, not "corrected."
- Tested saturation 1.00/1.10/1.20 plus the chosen 1.15 against a sample
  frame before touching the full render (per the skill's grade philosophy
  — reason from a frame, don't apply a fixed preset blindly). 1.15 with
  contrast bumped to 1.08 made the venue's green read vivid/professional
  while skin tones stayed natural — no hue shift toward red like the
  Sthanley case.
- Re-extracted both interview segments with the new grade (cut points
  unchanged — this was a grade-only fix), re-concatenated with the
  already-normalized vignette segment, spot-checked the new render's
  color. Replaced `EDITADOS/entrevista lmc 2 evangelista cyborg -
  editado.mp4` in place.
- Rewrote the saturation guidance in `CLAUDE.md`: it's explicitly no
  longer a fixed default value — it's a per-shoot judgment call, tested
  against a sample frame each time, with 0.85 and 1.15 recorded as two
  real data points from two different lighting setups, not two
  competing "correct" defaults.

**Reasoning log:**
- The user's own uncertainty ("não sei se a instrução... foi diminuir a
  saturação no original") was the right question to ask — a value copied
  forward from the previous interview's fix without re-checking against
  the new footage is exactly the kind of unverified carry-over that
  causes this sort of regression. Worth remembering as a general pattern:
  numeric grade defaults should be re-validated per source, not
  inherited silently.

**Outstanding:**
- Awaiting user validation of the re-graded cut before YouTube upload.
