# Edição de Vídeo com IA — Liga Monstro Combate 2

Portfólio dos cortes de entrevista do evento LMC 2, editados com auxílio de IA (Claude): transcrição, remoção de silêncios/erros, legendas, grade de cor e finalização — do bruto ao vídeo publicado.

## Entrevistas

| Entrevistado | Assista | Modelo | Tempo de edição |
|---|---|---|---|
| Rangel Farias | [YouTube](https://youtu.be/c3HtwDRorsw) | não registrado¹ | não cronometrado¹ |
| Sthanley "o Máscara" | aguardando publicação | Claude Sonnet 5 | ~37min (18min corte inicial + 19min de ajustes pós-validação) |

¹ Métricas não capturadas na primeira edição — passaram a ser registradas a partir da segunda.

## Processo

A cada entrevista, a IA:

1. Transcreve o áudio bruto.
2. Remove silêncios, gaguejos, falsas partidas e retakes, mantendo só a melhor versão de cada resposta.
3. Corta o início/fim para começar e terminar em conteúdo de entrevista, sem sobra de preparação/bastidor.
4. Aplica grade de cor sutil e uma limpeza leve de ruído no áudio.
5. Insere legendas quando o destino de publicação exige (não usadas para YouTube, que tem legenda nativa).
6. Acrescenta a vinheta de encerramento padrão.

As orientações completas do processo (incluindo os ajustes aprendidos a cada edição) estão em [CLAUDE.md](CLAUDE.md).

## Ferramentas

- **[video-use](https://github.com/browser-use/video-use)** — skill open source usada para transcrição, seleção de cortes, grade de cor e legendas dentro do Claude Code.
- **[youtube-upload/](youtube-upload)** — automação própria (Node.js + YouTube Data API) para publicar os cortes validados direto no canal da LMC.
