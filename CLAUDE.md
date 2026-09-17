# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This folder holds raw interview footage from the LMC 2 event, to be edited into finished, publishable interview videos. It is not a code project — there is no build, lint, or test process. Work here means cutting and captioning video files.

## Editing brief

For each raw interview in this folder, produce a finished cut that:

1. **Removes dead air and filler** — long breaths, silences, "uh"/"é"/stammering, false starts.
2. **Removes mistakes and retakes** — flubbed lines, restarted answers; keep only the clean take.
3. **Trims non-interview footage** — setup/mic-check chatter before the interview starts and any wrap-up/off-topic talk after it ends. The final cut should begin and end on actual interview content.
4. **Adds burned-in subtitles when the delivery target calls for them** — see "Lições da primeira edição" below for the per-platform policy.
5. **Applies a subtle color grade and light audio denoise by default** — see "Lições da primeira edição" below for the exact settings.
6. **Appends the closing vignette** — `vinheta encerramento horizontal.mp4` gets appended as the outro of every finished interview.

Ask which raw interview to work on if more than one is present and it isn't specified — filenames follow the pattern `entrevista lmc 2 <interviewee name>.MP4`.

**Do not delete a raw interview file until its finished cut has been validated AND published to YouTube AND saved to the Liga Monstro Drive.** The raw for the Rangel Farias interview was deleted right after validation, before the Drive backup — it worked out because no re-edit was needed, but if a re-cut or a different aspect-ratio version is ever needed later, that source is gone for good. Ask before deleting any raw file.

## Source files

- `entrevista lmc 2 rangel farias.MP4` — raw interview footage. 3840x2160 (4K), ~59.94 fps, HEVC video, mono AAC audio @ 48kHz. Contains GoPro-style metadata/thumbnail streams alongside the main video track — expect additional raw interview files in this same format to be dropped in over time.
- `vinheta encerramento horizontal.mp4` — the standard closing vignette/bumper (horizontal orientation) to append to every edited interview. 3840x2160 (4K), 30 fps, HEVC video, stereo AAC audio @ 44.1kHz, ~1.6s.

Note the frame rate and audio channel-count mismatch between raw interviews and the vignette (59.94fps mono vs. 30fps stereo) — account for this when concatenating so the join doesn't glitch or drop audio.

## Tooling

`ffmpeg` and `ffprobe` are available on PATH. Use the `video-use` skill for conversational video editing (transcription, cutting, subtitle burn-in, concatenation) rather than hand-rolling ffmpeg pipelines from scratch.

## Output convention

No output/exports folder exists yet — ask the user where finished cuts should be saved before writing the first one, then keep using that location.

## Lições da primeira edição (Rangel Farias)

Feedback recolhido durante a validação do primeiro corte — aplicar como padrão desde o início dos próximos cortes, não como ajuste posterior.

**Legendas (burn-in):**
- Para entrega no **YouTube**, NÃO gravar legenda na imagem — usar o sistema de legendas nativo do YouTube. Legenda embutida é só para destinos sem legenda nativa (ex.: envio direto por WhatsApp/Instagram).
- Quando a legenda embutida for necessária, usar fonte pequena e posicionada no terço inferior (não colada na borda), texto branco em negrito com contorno, sem caixa de fundo pesada. O primeiro corte errou usando fonte grande (2x para 4K) posicionada alta demais na tela — isso foi apontado como "o maior problema" daquele corte. Conferir o enquadramento num frame de amostra antes de renderizar tudo.

**Grade de cor e áudio:**
- Aplicar grade sutil por padrão (contraste leve + curva S), não deixar sem grade — a imagem crua da câmera do evento sai "chapada"/pouco profissional.
- Aplicar denoise bem leve na trilha do microfone da entrevista por padrão, mesmo quando o áudio parece "bom" — só nessa trilha, nunca na trilha de música/vinheta.
- Cuidado com o parâmetro `nf` do denoise: um ajuste agressivo (`nf` bem acima do padrão) fez as vozes soarem "como se estivessem falando dentro de um banheiro" (efeito oco/reverberante). Se precisar de mais redução de ruído, subir `nr` aos poucos — nunca mexer em `nf`.

**Corte de abertura:**
- Não deixar "ar morto" no início só porque as pessoas já estavam posicionadas — cortar bem próximo da primeira palavra falada, com ~200ms de folga antes dela (não no início bruto do arquivo).

**Backup do bruto:**
- Só apagar o arquivo bruto depois que o corte validado estiver publicado no YouTube E salvo no Drive da Liga Monstro — ver aviso na seção "Editing brief" acima.
