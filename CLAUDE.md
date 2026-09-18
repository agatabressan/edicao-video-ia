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

## Lições acumuladas (Rangel Farias + Sthanley "o Máscara")

Feedback recolhido na validação de cada corte — aplicar como padrão desde o início dos próximos cortes, não como ajuste posterior.

**Legendas (burn-in):**
- Para entrega no **YouTube**, NÃO gravar legenda na imagem — usar o sistema de legendas nativo do YouTube. Legenda embutida é só para destinos sem legenda nativa (ex.: envio direto por WhatsApp/Instagram).
- Quando a legenda embutida for necessária, usar fonte pequena e posicionada no terço inferior (não colada na borda), texto branco em negrito com contorno, sem caixa de fundo pesada. O primeiro corte errou usando fonte grande (2x para 4K) posicionada alta demais na tela — isso foi apontado como "o maior problema" daquele corte. Conferir o enquadramento num frame de amostra antes de renderizar tudo.

**Grade de cor e áudio:**
- Aplicar grade sutil por padrão (contraste leve + curva S + saturação levemente reduzida), não deixar sem grade — a imagem crua da câmera do evento sai "chapada"/pouco profissional.
- **Saturação NÃO é um valor fixo — depende de quão saturada a captação já está.** No corte do Sthanley, a iluminação do palco estava muito intensa e saturação 1.0 deixou o rosa da marca puxando pro vermelho; a correção foi baixar pra 0.85. Já no corte do Evangelista Cyborg, a luz era mais fraca/acinzentada e aplicar esse mesmo 0.85 (herdado cegamente do caso anterior) deixou a imagem "apagada". Corrigido pra 1.15 nesse caso, com contraste 1.08, e ficou com aspecto profissional sem puxar o tom de pele.
  **Regra prática:** antes de bater o corte final, tirar um frame de amostra do bruto e testar 2-3 valores de saturação (ex.: 0.85, 1.0, 1.15) lado a lado — subir até o cenário/cores de marca ficarem vívidos, mas parar assim que a pele começar a puxar pra vermelho/laranja ou alguma cor de marca mudar de tom. Baseline pra começar o teste: `eq=contrast=1.06-1.08:brightness=0.0:saturation=X,curves=master='0/0 0.25/0.23 0.75/0.77 1/1'`.
- Aplicar denoise bem leve na trilha do microfone da entrevista por padrão, mesmo quando o áudio parece "bom" — só nessa trilha, nunca na trilha de música/vinheta.
- Cuidado com o parâmetro `nf` do denoise: um ajuste agressivo (`nf` bem acima do padrão) fez as vozes soarem "como se estivessem falando dentro de um banheiro" (efeito oco/reverberante). Se precisar de mais redução de ruído, subir `nr` aos poucos — nunca mexer em `nf`.

**Corte de abertura:**
- Não deixar "ar morto" no início só porque as pessoas já estavam posicionadas — cortar bem próximo da primeira palavra falada, com ~200ms de folga antes dela (não no início bruto do arquivo).
- **Risada/reação antes da primeira palavra falada também conta como "ar morto" a cortar**, não como conteúdo obrigatório — no corte do Sthanley, o áudio começava com ~3s de risada antes da primeira fala, e isso foi sinalizado como sobra a remover. Regra prática: ancorar o corte de abertura na primeira **palavra falada** do transcript, não no primeiro evento de áudio (risada, tosse, etc.), a menos que o usuário peça pra manter esse momento especificamente.

**Backup do bruto:**
- Só apagar o arquivo bruto depois que o corte validado estiver publicado no YouTube E salvo no Drive da Liga Monstro — ver aviso na seção "Editing brief" acima.

**⚠️ REGRA OBRIGATÓRIA — verificar o canal antes de TODA publicação/atualização no YouTube, sem exceção:**
Isso já causou publicação no canal errado DUAS vezes (entrevistas do Cyborg e do Marcelo do Ó), mesmo já tendo dado certo numa sessão anterior. O token salvo (`credentials/token-youtube.json`) pode reverter pro canal errado silenciosamente entre sessões (ex.: expiração do token em modo "Testing" do Google Cloud — 7 dias — forçando um re-login que, se não seguir a instrução abaixo, cai na conta errada por padrão). Portanto, **em toda sessão nova, antes de rodar `upload.js` ou qualquer `videos.update`, rodar**:
```bash
node youtube-upload/check-channel.js youtube
```
O script já falha (`exit 1`) e avisa se o canal não for "LMC | Liga Monstro Combate" (ID `UClGFqfpNtUpUD1v51mw3VbQ`). Se der errado (ou o token não existir/expirou), rodar `node auth.js youtube` e, na tela de escolha de conta do Google, selecionar **"Liga Monstros" (Conta de marca)** — nunca a conta com e-mail, que sempre resolve pro canal errado. Nunca pular essa checagem só porque "já funcionou antes".

Considerar mudar o app OAuth de "Testing" pra "Em produção" no Google Cloud Console pra eliminar a expiração de 7 dias na raiz (oferecido ao usuário, ainda não confirmado/feito).

**Terminologia e metadados de publicação (YouTube):**
- Usar **"cage"**, nunca "ringue" — a LMC luta em cage, não em ringue.
- O nome de ringue do lutador é **"Sthanley 'O Maskara'"** — grafia com K, sem acento, validada com o próprio atleta. Não "normalizar" para "Máscara".
- **Privacidade padrão: `unlisted` (não listado).** Só publicar como `public` se o usuário pedir explicitamente. `upload.js` já usa `unlisted` como fallback se o `metadata.json` não especificar `privacyStatus`, mas montar o metadata já com `"privacyStatus": "unlisted"` explícito por clareza.
- **A assinatura padrão do canal (links de redes sociais, WhatsApp, contato) NÃO é confiável via upload por API.** Esse preenchimento automático é um recurso da tela de upload do YouTube Studio (pré-preenche a caixa de descrição), não algo aplicado pelo servidor a uploads via API — pode não aparecer, aparecer com atraso, ou duplicar se for colada manualmente por cima. **Sempre incluir o bloco de assinatura explicitamente na descrição enviada pela API**, não deixar pra confiar no automático. Texto padrão:
  ```
  -------
  🔗 SIGA O LMC NAS REDES SOCIAIS:
  Instagram: https://www.instagram.com/ligamonstrocombate
  YouTube: https://www.youtube.com/@ligamonstrocombate

  ✅ ENTRE PARA A COMUNIDADE OFICIAL (WHATSAPP):
  Acompanhe os bastidores, receba promoções exclusivas e notícias em primeira mão!
  👉 https://chat.whatsapp.com/Imp2AbdHdAb0rZNt3G8QbK

  📧 CONTATO COMERCIAL:
  contato@ligamonstrocombate.com.br

  👽 LIGA MONSTRO COMBATE: A NOVA ERA DO MMA NO BRASIL!
  ```
- `videos.update` (para corrigir um vídeo já publicado) precisa do escopo `youtube.force-ssl`, que `youtube.upload` + `youtube.readonly` sozinhos não cobrem — já adicionado em `auth.js`.
- **CRÍTICO — autenticação do YouTube é uma Conta de marca, separada da conta de e-mail:** a conta de login (`contato@ligamonstrocombate.com.br`) administra duas identidades do YouTube: **"Liga Monstros"** (Conta de marca = canal "LMC | Liga Monstro Combate", o correto) e o canal pessoal da própria conta ("Universo Monstro", **errado**, não usar). Selecionar a conta com e-mail na tela de login SEMPRE resolve pra "Universo Monstro" via `channels.list(mine=true)`, mesmo definindo LMC como canal padrão no youtube.com — isso não muda esse comportamento da API. **Só selecionar "Liga Monstros" na tela de escolha de conta garante o canal certo.** Depois de qualquer login, sempre confirmar com `channels.list({mine:true})` antes de publicar ou atualizar qualquer vídeo — nunca assumir.
- **Contas de marca NÃO têm acesso ao Google Drive** (nem a outros serviços do Google além do YouTube). Pedir o escopo `drive` no mesmo login que pede escopos do YouTube quebra a seleção de "Liga Monstros" com o erro "Serviço indisponível". Por isso o YouTube e o Drive usam **logins e tokens completamente separados**: `node auth.js youtube` → `credentials/token-youtube.json` (selecionar "Liga Monstros"), `node auth.js drive` → `credentials/token-drive.json` (selecionar a conta com e-mail, "LMC"). Nunca tentar unificar os dois num único login.
- Sempre incluir tags de vídeo (title/description/tags) cobrindo as variações "Liga Monstro Combate", "LMC" e "LMC 2" para SEO — não depender só do título.
- Se algo for dito errado durante a entrevista (ex.: nome de adversário trocado), não é motivo pra recortar/re-editar — sinalizar a correção na descrição do YouTube como uma "errata" em vez de mexer no corte.
- **Telas finais (end screens) não são configuráveis pela API do YouTube** — precisam ser adicionadas manualmente pelo usuário no YouTube Studio (Conteúdo → vídeo → Editor → Tela final) depois da publicação.

**Backup final no Drive:**
- Depois de publicado no YouTube, o corte final também é enviado pra uma pasta do Google Drive da Liga Monstro (arquivo definitivo do projeto).
- Script: `youtube-upload/drive-upload.js <arquivo> <folderId>` — usa `credentials/token-drive.json` (login separado do YouTube, ver acima).
- **O ID/link da pasta do Drive NUNCA vai neste repositório** (é público) — fica salvo só localmente em `youtube-upload/credentials/drive-folder.txt` (já coberto pelo `.gitignore` da pasta `credentials/`). Se essa pasta não existir numa sessão nova, pedir o link ao usuário de novo.
