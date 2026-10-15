# Edição de Vídeo com IA — Liga Monstro Combate 2

Portfólio dos cortes de entrevista do evento LMC 2, editados com auxílio de IA (Claude): transcrição, remoção de silêncios/erros, legendas, grade de cor e finalização — do bruto ao vídeo publicado.

## Por que importa

Nenhum editor foi contratado, nem por vídeo nem por hora. O fluxo cobre edição e publicação do início ao fim, do bruto ao YouTube com backup no Drive, rodando em segundo plano enquanto a gente seguia em outras frentes. A participação humana ficou só na validação final. Como quem sobe vídeo nem sempre domina SEO de YouTube, cada upload sai com títulos, descrições e metadados padronizados. Além dos 15 vídeos editados, as 14 lutas completas foram publicadas em lote automaticamente.

## Entrevistas

| Entrevistado | Assista | Modelo | Tempo de edição |
|---|---|---|---|
| Rangel Farias | [YouTube](https://youtu.be/c3HtwDRorsw) | não registrado¹ | não cronometrado¹ |
| Sthanley "O Maskara" | [YouTube](https://youtu.be/k6YWMREPOtc) | Claude Sonnet 5 | ~37min (18min corte inicial + 19min de ajustes pós-validação) |
| Evangelista Cyborg | [YouTube](https://youtu.be/zjY9A4tsqoI) | Claude Sonnet 5 | ~43min (19min corte inicial + 24min de ajuste de cor pós-validação) |
| Marcelo do Ó | [YouTube](https://youtu.be/OTfvfxfkx58) | Claude Sonnet 5 | não cronometrado² |
| Renata e Jamil Achlei | [YouTube](https://youtu.be/Voc34ljvLb0) (não listado) | Claude Sonnet 5 | ~34min³ |
| Sandribas | [YouTube](https://youtu.be/Uz8LkSv3hs8) (não listado) | Claude Sonnet 5 | ~48min |
| Rony Jason | [YouTube](https://youtu.be/zCkb1c8h4GU) (não listado) | Claude Sonnet 5 | ~22min |
| Nathy Silva | [YouTube](https://youtu.be/3EKrhd47ZsQ) (não listado) | Claude Sonnet 5 | ~23min |
| Ryan Tupã | [YouTube](https://youtu.be/WvOFY2mx1Nw) (não listado) | Claude Sonnet 5 | ~48min |
| Maycon Alcino | [YouTube](https://youtu.be/IrTDAyO0Mc0) (não listado) | Claude Sonnet 5 | ~22min⁴ |
| Rayan Polacco | [YouTube](https://youtu.be/48J7fcONSTc) (não listado) | Claude Sonnet 5 | ~19min⁴ |
| Felipe Pamplona | [YouTube](https://youtu.be/DaFpS33Fxzs) (não listado) | Claude Sonnet 5 | ~23min⁴ |
| Vitão | [YouTube](https://youtu.be/ZMbVU9ercQ8) (não listado) | Claude Sonnet 5 | ~10min⁴ |
| Mauro Iankoski | [YouTube](https://youtu.be/amWv7y9xOJ0) (não listado) | Claude Sonnet 5 | ~46min⁴⁵ |
| Bastidores RedeTV (vlog, 4 brutos) | [YouTube](https://youtu.be/kitBxc0-KIw) (não listado) | Claude Opus 5.5 | ~96min⁴⁶ |
| LMC 3 — Pesagem: Melk, Alex Cowboy e Elizeu Capoeira (trecho da transmissão) | [YouTube](https://youtu.be/QLnbyVYDD4g) (não listado) | Claude Opus 5.5 | ~11min⁷ |
| LMC 3 — 14 lutas completas (só publicação, sem edição) | ver [lmc3_lutas_results.json](youtube-upload/lmc3_lutas_results.json) (não listados) | Claude Opus 5.5 | ~28min⁸ |

¹ Métricas não capturadas na primeira edição — passaram a ser registradas a partir da segunda.
² Tempo de edição não cronometrado nesta sessão (execução em segundo plano intercalada com outras tarefas).
³ Reconstruído via timestamp dos arquivos gerados (download → corte final pronto), não por cronômetro ao vivo — a partir desta edição, o tempo passa a ser cronometrado explicitamente em toda sessão (ver CLAUDE.md).
⁴ A partir desta edição, o tempo passa a contar só o trabalho ativo (download, transcrição, corte, encode), excluindo o intervalo de espera pela resposta/validação do usuário — a pedido explícito dele.
⁵ Soma de duas sessões: ~27min do corte inicial + ~19min de ajuste pós-validação (grade de cor mais clara/saturada e novo ponto de corte final no "Oss!" do apresentador).
⁶ Formato vlog montado a partir de 4 brutos (~8min17s de material, 6,3GB) com fusão curta entre eles. Soma de três rodadas: ~72min do corte inicial (~60min só de encode 4K) + ~13min de ajuste pós-feedback (caminhada inteira na abertura + correção de formato de cor que travava o player do Windows) + ~11min de segundo ajuste (takes mantidos contínuos onde o corte fazia o apresentador "pular" de lugar).
⁷ Trecho (39:44–46:48) da transmissão ao vivo da pesagem do LMC 3, já em 1080p e com áudio mixado pela emissora — por isso sem denoise.
⁸ Brutos das lutas baixados do Drive e enviados um a um ao YouTube (`youtube-upload/lmc3-lutas-batch.js`), sem corte/grade. Soma de duas rodadas: ~25min pras 13 primeiras + ~3min pra Luta 5, que entrou no Drive depois.

## Processo

A cada entrevista, a IA:

1. Transcreve o áudio bruto.
2. Remove silêncios, gaguejos, falsas partidas e retakes, mantendo só a melhor versão de cada resposta.
3. Corta o início/fim para começar e terminar em conteúdo de entrevista, sem sobra de preparação/bastidor.
4. Aplica grade de cor sutil e uma limpeza leve de ruído no áudio.
5. Insere legendas quando o destino de publicação exige (não usadas para YouTube, que tem legenda nativa).
6. Acrescenta a vinheta de encerramento padrão.
7. Após validação, publica no YouTube e envia o arquivo final para o backup no Drive da Liga Monstro.

As orientações completas do processo (incluindo os ajustes aprendidos a cada edição) estão em [CLAUDE.md](CLAUDE.md).

## Ferramentas

- **[video-use](https://github.com/browser-use/video-use)** — skill open source usada para transcrição, seleção de cortes, grade de cor e legendas dentro do Claude Code.
- **[youtube-upload/](youtube-upload)** — automação própria (Node.js) com dois scripts: `upload.js` publica os cortes validados direto no canal da LMC via YouTube Data API, e `drive-upload.js` envia o arquivo final para o backup no Drive da Liga Monstro via Google Drive API.
