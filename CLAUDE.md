# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This folder holds raw interview footage from the LMC 2 event, to be edited into finished, publishable interview videos. It is not a code project — there is no build, lint, or test process. Work here means cutting and captioning video files.

## Editing brief

For each raw interview in this folder, produce a finished cut that:

1. **Removes dead air and filler** — long breaths, silences, "uh"/"é"/stammering, false starts.
2. **Removes mistakes and retakes** — flubbed lines, restarted answers; keep only the clean take.
3. **Trims non-interview footage** — setup/mic-check chatter before the interview starts and any wrap-up/off-topic talk after it ends. The final cut should begin and end on actual interview content.
4. **Adds burned-in subtitles** — accurate, readable captions for the full interview, for accessibility.
5. **Appends the closing vignette** — `vinheta encerramento horizontal.mp4` gets appended as the outro of every finished interview.

Ask which raw interview to work on if more than one is present and it isn't specified — filenames follow the pattern `entrevista lmc 2 <interviewee name>.MP4`.

## Source files

- `entrevista lmc 2 rangel farias.MP4` — raw interview footage. 3840x2160 (4K), ~59.94 fps, HEVC video, mono AAC audio @ 48kHz. Contains GoPro-style metadata/thumbnail streams alongside the main video track — expect additional raw interview files in this same format to be dropped in over time.
- `vinheta encerramento horizontal.mp4` — the standard closing vignette/bumper (horizontal orientation) to append to every edited interview. 3840x2160 (4K), 30 fps, HEVC video, stereo AAC audio @ 44.1kHz, ~1.6s.

Note the frame rate and audio channel-count mismatch between raw interviews and the vignette (59.94fps mono vs. 30fps stereo) — account for this when concatenating so the join doesn't glitch or drop audio.

## Tooling

`ffmpeg` and `ffprobe` are available on PATH. Use the `video-use` skill for conversational video editing (transcription, cutting, subtitle burn-in, concatenation) rather than hand-rolling ffmpeg pipelines from scratch.

## Output convention

No output/exports folder exists yet — ask the user where finished cuts should be saved before writing the first one, then keep using that location.
