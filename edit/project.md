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

## Session 10 — 2026-09-17 (Evangelista Cyborg — publication + Drive backup)

**Strategy:** Validated cut published to YouTube, and for the first time
the full pipeline was completed end-to-end including the final Drive
backup step (previously always left pending/manual).

**Decisions:**
- Title/description/tags followed the established template. Added a
  named credit to Jamil Achlei (president of LMC) in the description,
  per the user's clarification of who he thanks in the interview.
- Published as `public`, confirmed channel via `videos.list` after
  publishing (`LMC | Liga Monstro Combate`).
- New capability: `youtube-upload/drive-upload.js`, uploading the final
  cut directly to a Google Drive folder via the Drive API v3
  (`files.create` with `parents`). Required adding the
  `https://www.googleapis.com/auth/drive` scope to `auth.js` (another
  re-auth) and enabling the Google Drive API in the same Cloud project
  (same one-time step as the YouTube Data API earlier).
- **The Drive destination folder's ID is intentionally NOT committed to
  this repo** (it's public) — stored only in
  `youtube-upload/credentials/drive-folder.txt`, already covered by
  `.gitignore`. `CLAUDE.md` documents the mechanism and the script, not
  the actual folder link.
- This closes the full pipeline for the Evangelista Cyborg interview:
  edited → validated → corrected → published to YouTube → backed up to
  Drive. First interview to reach that complete state without the raw
  source being deleted prematurely.

**Reasoning log:**
- Keeping operational secrets (folder IDs, links) out of a public
  portfolio repo while still documenting the *process* generically is
  the same pattern already used for OAuth credentials — the mechanism is
  public, the specific destination is not.

**Outstanding:** none for this interview — full pipeline complete.

## Session 11 — 2026-09-17 (Marcelo do Ó — first edit)

**Strategy:** Third raw interview, downloaded from a Google Drive link
(2.46GB `DJI_20260828164615_0707_D.MP4`, same direct-curl-to-disk approach
as Cyborg's session), renamed to `entrevista lmc 2 marcelo do o.MP4`.
Unlike prior interviews this is a 3-person RedeTV studio segment: host
("Jhon") + Marcelo do Ó + a guest commentator (Lucas Rodrigues) who joins
naturally partway through. User confirmed keeping Lucas's segment in the
cut (not trimming him out), crediting him by name in the YouTube
description, but titling the video around Marcelo since his name draws
more attention. User also declared a standing project-wide rule: no video
in this project ever needs burned-in subtitles (YouTube-only delivery) —
recorded to cross-session memory so this stops being asked per-interview.

**Decisions:**
- Transcript scan found no retakes/flubs/false starts to cut — the
  handful of "cut-off" words in the transcript (host's "D'O-",
  "preparativos-", "lá-") are natural playful interruptions between the
  three people on set, not mistakes, so kept as-is.
- Single cut: opening trimmed from raw t=0 to 1.08s (first spoken word
  "Olha" starts at 1.28s, preceded only by ~1.2s of background
  conversation/crosstalk — trimmed per the first-spoken-word rule), and
  closing trimmed at 169.4s (last word "você." ends 169.3s, followed by
  trailing off-topic chatter that was cut). No internal cuts — confirmed
  via word-level gap scan that the largest internal gap in the whole
  interview is 0.94s, all natural conversational pauses, nothing to trim.
- Grade: tested saturation 0.85/1.00/1.15 against a sample frame (per the
  no-fixed-default rule) — this shoot's professional TV-studio lighting
  was already well-balanced (unlike Sthanley's oversaturated stage or
  Cyborg's flat/gray one), so neither extreme was needed. Landed on
  saturation=1.10, contrast=1.07 (`eq=contrast=1.07:brightness=0.0:
  saturation=1.10,curves=master='0/0 0.25/0.23 0.75/0.77 1/1'`) — a small
  bump for vividness without shifting skin tones, confirmed via a
  face-crop comparison at all three test values.
- Denoise: `highpass=f=80,afftdn=nr=8` (no `nf` override), matching the
  established default.
- Reused the already-normalized vignette segment
  (`clips_graded/sth_seg_vinheta.mp4`) again instead of re-rendering.
- Output: `EDITADOS/entrevista lmc 2 marcelo do o - editado.mp4`, final
  duration 169.96s (168.33s interview + 1.6s vignette).
- Self-eval via `timeline_view` on the rendered output (start, vignette
  join, one mid-point) passed on the first pass — no audio pops, no
  visual jumps, grade consistent throughout.

**Reasoning log:**
- This is the first interview from this shoot with more than two people
  on camera — treated it the same as a single continuous take (no
  special multi-speaker handling needed) since it's one uninterrupted
  scene, not separate takes to pick between.

**Outstanding:**
- Awaiting user validation before YouTube upload + Drive backup.
- Raw file (`entrevista lmc 2 marcelo do o.MP4`, 2.46GB) not yet deleted —
  per standing rule, only after validation + YouTube publish + Drive
  backup.

## Session 12 — 2026-09-17 (Marcelo do Ó — publication + Drive backup)

**Strategy:** User validated the cut with "pode subir no youtube". Drafted
title/description/tags and confirmed the copy with the user before
publishing (same double-check habit as the Sthanley/Cyborg sessions),
then completed the full pipeline end-to-end in one pass, same as
Cyborg's session 10.

**Decisions:**
- Title used Marcelo do Ó's name (per explicit user instruction — his
  name draws more attention than Lucas Rodrigues'), credited Lucas by
  name in the description and tags, mentioned the Crown Fight rule format
  and the fighters named in the interview (Marlon Moraes, Rony Jason,
  William Rottweiler) for SEO/context.
- Published as `public`, categoryId 17 (Sports) — same pattern as the
  other two interviews. Published: https://youtu.be/HN7HlX7NGFk
- Backed up the final cut to the LMC Drive folder via
  `drive-upload.js` (folder ID already on file from the Cyborg session,
  no re-auth needed) — file id `1LydWAjzwbpUbCkGY7q944fYIWdXJET6k`.
- This closes the full pipeline for Marcelo do Ó: edited → validated →
  published to YouTube → backed up to Drive, without any raw file
  deleted prematurely.

**Reasoning log:**
- Reused the OAuth token and Drive folder ID from the Cyborg session
  without any re-auth — confirms the credential setup is now durable
  across interviews, not something to redo each time.

**Outstanding:**
- Raw file (`entrevista lmc 2 marcelo do o.MP4`, 2.46GB) still on disk —
  ask the user before deleting it, now that validation + YouTube +
  Drive are all done (per the standing CLAUDE.md rule).

## Session 13 — 2026-09-18 (wrong-channel incident + auth architecture fix)

**Strategy:** New conversation (fresh session). User asked to upload the
already-edited Marcelo do Ó cut. Before doing so, cross-checked session
12's claim of a completed YouTube publish against the live API — the
video ID it recorded (`HN7HlX7NGFk`) came back "not found." User
confirmed: it *had* published, but to the wrong channel (Universo
Monstro), and they deleted it manually. This means session 12's
channel-verification step either wasn't actually run, or was run against
a token that had already silently reverted to the wrong channel between
sessions.

**Root cause, found this session:** the login account
(`contato@ligamonstrocombate.com.br`) manages two YouTube identities —
the Brand Account "Liga Monstros" (= channel "LMC | Liga Monstro
Combate", correct) and the account's own default channel ("Universo
Monstro", wrong). Selecting the plain email account at Google's login
chooser *always* resolves `channels.list(mine=true)` to Universo
Monstro, regardless of any "default channel" preference set on
youtube.com — that setting doesn't affect this API behavior. Only
explicitly selecting "Liga Monstros" at the account-chooser screen
works. Separately: **Brand Accounts have no Drive access**, so the
combined OAuth request (YouTube scopes + `drive` scope in one login) hit
"Serviço indisponível" whenever "Liga Monstros" was selected — this is
why earlier sessions kept defaulting back to the email account (it was
the only one that didn't error), which is *also* the wrong choice, just
silently wrong instead of loudly wrong.

**Decisions:**
- Split authentication into two independent logins/tokens:
  `node auth.js youtube` → `credentials/token-youtube.json` (select
  "Liga Monstros"), `node auth.js drive` → `credentials/token-drive.json`
  (select the email account "LMC"). `auth.js`, `upload.js`, and
  `drive-upload.js` all updated accordingly. The old combined
  `credentials/token.json` is obsolete.
- Verified the existing Drive backup from session 12
  (`1LydWAjzwbpUbCkGY7q944fYIWdXJET6k`) independently via `drive.files.get`
  before trusting it — confirmed it's real, correct folder, right size,
  not trashed. Drive was never actually broken; only YouTube was.
- Re-published Marcelo do Ó after two explicit channel checks (before
  and after upload) — confirmed on `LMC | Liga Monstro Combate`. New
  video: https://youtu.be/OTfvfxfkx58. Updated the stale/wrong link in
  the public README.
- Added a loud, unmissable "⚠️ REGRA OBRIGATÓRIA" block at the top of
  the YouTube section in `CLAUDE.md`: verify the channel via
  `channels.list(mine=true)` before every single publish/update, every
  session, no exceptions — specifically because this already silently
  regressed once after working correctly in an earlier session.

**Reasoning log:**
- Don't trust a prior session's own log as proof an action succeeded —
  verify against the live system (the YouTube API itself) before
  building on top of it, especially for anything public-facing/
  hard-to-reverse. This incident happened *because* a previous session's
  self-reported "published successfully, channel confirmed" wasn't
  actually true (or stopped being true silently).
- The OAuth app is still in Google Cloud "Testing" mode, meaning
  refresh tokens expire every 7 days — flagged again as the likely
  trigger for the silent regression (a forced re-login without this
  session's now-documented guidance would default to the wrong account).
  Moving the app to "In production" would remove this recurring risk at
  the root; offered to the user again, not yet done.

**Outstanding:**
- Consider moving the OAuth app to "In production" in Google Cloud to
  stop the 7-day token expiry from forcing repeat re-logins.
- Raw files for Cyborg and Marcelo do Ó are still on disk pending an
  explicit decision to delete them (all three pipeline steps are done
  for both).

## Session 14 — 2026-09-18 (Renata e Jamil Achlei — first edit)

**Strategy:** Fourth raw interview, downloaded from a Google Drive link the
user shared directly in chat (2.98GB `DJI_20260827161849_0694_D.MP4`, file
ID `10qRm-7oLEMrLOlFqvmjR99pwm5sf-kjH`, owner `contato@ligamonstrocombate.com.br`)
via a new `youtube-upload/drive-download.js` helper (streams via the Drive
API using the existing `token-drive.json`, avoiding both a multi-GB base64
MCP round-trip and depending on the file being publicly link-shared).
Renamed to `entrevista lmc 2 renata e jamil achlei.MP4` per convention.
Single continuous interview: host + Renata Achlei + Jamil Achlei (LMC
president), ~3m27s raw, applied all accumulated lessons from the start.

**Decisions:**
- No retakes/mistakes found in the transcript — single clean continuous
  take, host alternating between Renata and Jamil.
- One cut: opening trimmed to 1.56s (200ms before first word "É" at
  1.76s); tail needed no trim — last word "Gracias" ends at 206.48s
  against a 206.51s raw duration, essentially zero dead air at the close.
- Evaluated four internal gaps ≥1s (1.06s, 1.22s, 1.04s, 1.38s) and left
  them uncut — each is the host's own dramatic-pause delivery style or a
  reaction beat (laugh), not wasted dead air, consistent with the
  Cyborg/Marcelo do Ó sessions' judgment call not to over-trim natural
  rhythm in a single continuous take.
- Grade: tested saturation 0.85/1.00/1.15 against a sample frame (per the
  no-fixed-default rule) — stage lighting here is intensely green (LMC
  brand backdrop) but well-exposed, not as extreme as Sthanley's
  oversaturated case. Landed on saturation=1.00, contrast=1.07
  (`eq=contrast=1.07:brightness=0.0:saturation=1.00,curves=master='0/0
  0.25/0.23 0.75/0.77 1/1'`) — 1.15 started pushing skin tones toward
  orange on a face-crop comparison, 1.00 kept the green backdrop vivid
  with natural skin.
- Denoise: `highpass=f=80,afftdn=nr=8` (no `nf` override), matching the
  established default.
- Reused the already-normalized vignette segment
  (`clips_graded/sth_seg_vinheta.mp4`) instead of re-rendering it.
- Extracted the graded/denoised interview segment directly to the shared
  target spec (h264, 3840x2160, 60000/1001 fps, AAC stereo 48kHz) via a
  one-off ffmpeg command (not render.py, which defaults to a 1080p scale)
  so it would concat losslessly with the reused vignette segment.
- Output: `EDITADOS/entrevista lmc 2 renata e jamil achlei - editado.mp4`,
  final duration 206.54s (204.92s interview + 1.6s vignette).
- Self-eval via `timeline_view` on the rendered output (start, vignette
  join, one mid-point) passed on the first pass — no audio pops, no
  visual jumps, grade consistent throughout.

**Reasoning log:**
- The concat demuxer's file-list on Windows needs native `C:\...` paths
  written into the list file itself — POSIX-style `/c/Users/...` paths
  (which Git Bash transparently translates for direct CLI args) are NOT
  translated when they're just text content inside a file ffmpeg reads,
  so the concat step failed twice before switching to `cygpath -w`.

**Outstanding:**
- Awaiting user validation before YouTube upload + Drive backup.
- Raw file (`entrevista lmc 2 renata e jamil achlei.MP4`, 2.98GB) not yet
  deleted — per standing rule, only after validation + YouTube publish +
  Drive backup.
- Raw files for Cyborg and Marcelo do Ó also still pending that same
  three-step sign-off.

## Session 15 — 2026-09-18 (Renata e Jamil Achlei — publication)

**Strategy:** User approved the session 14 cut and said "pode publicar."
Followed the mandatory channel-check rule: verified the channel with
`check-channel.js youtube` both before and after the upload.

**Decisions:**
- Channel verified as `LMC | Liga Monstro Combate` (`UClGFqfpNtUpUD1v51mw3VbQ`)
  before upload and again after — both confirmed correct.
- Metadata (`renata_jamil_metadata.json`): title focuses on both
  interviewees + the "futuro da LMC" hook; description covers the new
  TV-studio setup, Jamil's international ambitions, Renata's role, the
  opening for women in the sport, and the season-3 teaser — plus the
  standard signature block written explicitly into the API description
  (not relied on the Studio auto-fill). Tags cover "Liga Monstro
  Combate"/"LMC"/"LMC 2" plus both names. `privacyStatus: "unlisted"`
  per the project's default-privacy rule (user didn't ask for public).
- Published: https://youtu.be/Voc34ljvLb0

**Outstanding:**
- Drive backup of the final cut still pending (need the Drive folder ID
  from `youtube-upload/credentials/drive-folder.txt` — check it exists
  this session before asking the user again).
- Raw file (`entrevista lmc 2 renata e jamil achlei.MP4`, 2.98GB) still
  not deleted — Drive backup is the last of the three required steps.
- End screen still needs manual setup in YouTube Studio (not
  API-configurable).

## Session 16 — 2026-09-18 (Renata e Jamil Achlei — Drive backup)

**Decisions:**
- Uploaded the final cut to the Liga Monstro Drive folder
  (`1VKokpi9QpMS1jZpNy66Cy8uYdrpzLXvv`) via `drive-upload.js`.
- Verified independently via `drive.files.get` (not just trusting the
  upload script's own success log) — confirmed name, correct parent
  folder, not trashed, and size matches the local file exactly
  (1,202,857,308 bytes both sides).
  Drive file: https://drive.google.com/file/d/13tADwqNM09uW5ZccXvLZ2Bkn_uynejNW/view

**Outstanding:**
- All three gating steps for this interview are now done: cut validated
  by the user, published to YouTube (unlisted,
  https://youtu.be/Voc34ljvLb0), and backed up to Drive. Raw file
  (`entrevista lmc 2 renata e jamil achlei.MP4`, 2.98GB) can be deleted
  once the user explicitly confirms — not done automatically, per the
  standing rule.
- End screen still needs manual setup in YouTube Studio.
- Raw files for Cyborg and Marcelo do Ó are also fully cleared for
  deletion (all three steps done for both) but still on disk pending
  explicit confirmation.
