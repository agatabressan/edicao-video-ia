"""Bastidores LMC 2 x RedeTV — vlog de 4 brutos com fusão curta entre eles.

Cada bruto vira um "capítulo" de segmentos (cortes secos internos). Entre
capítulos, uma fusão de XF segundos: o último segmento do capítulo A perde XF
no fim, o primeiro do B perde XF no início, e um clipe de transição (xfade +
acrossfade) é renderizado a partir das fontes. Tudo codificado uma vez só,
depois concat -c copy com a vinheta.
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = r"C:\Users\Ágata Bressan\Downloads\ENTREVISTAS LMC 2"
ED = os.path.join(ROOT, "edit", "bastidores")
SEG = os.path.join(ED, "segs")
os.makedirs(SEG, exist_ok=True)
FPS = 60000 / 1001
XF = 0.3
CURVE = "curves=master='0/0 0.25/0.23 0.75/0.77 1/1'"
AFX = "highpass=f=80,afftdn=nr=8"
EDL = json.load(open(os.path.join(ED, "edl.json"), encoding="utf-8"))


def src(i):
    return os.path.join(ROOT, f"bastidores lmc 2 - {i}.MP4")


def wav(i):
    return os.path.join(ED, "wav", f"src{i}.wav")


def vgrade(sat):
    return f"eq=contrast=1.07:brightness=0.0:saturation={sat},{CURVE},format=yuv420p"


def nframes(d):
    return max(1, round(d * FPS))


VENC = ["-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", "60000/1001",
        "-video_track_timescale", "60000"]
AENC = ["-c:a", "aac", "-b:a", "192k", "-ac", "2", "-ar", "48000"]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        sys.exit(f"FAIL: {' '.join(cmd)}\n{r.stderr[-2000:]}")


def plain(name, ch, s, e, force=False):
    n = nframes(e - s)
    d = n / FPS
    out = os.path.join(SEG, name + ".mp4")
    if os.path.exists(out):  # reaproveita segmento já renderizado
        return out, d
    fc = (f"[0:v]{vgrade(ch['sat'])}[v];"
          f"[1:a]atrim={s:.4f}:{s + d:.4f},asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,{AFX},"
          f"afade=t=in:st=0:d=0.03,afade=t=out:st={d - 0.03:.4f}:d=0.03[a]")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.4f}", "-i", src(ch["src"]), "-i", wav(ch["src"]),
         "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-frames:v", str(n), *VENC, *AENC, out])
    return out, d


def trans(name, a, ae, b, bs):
    n = nframes(XF)
    d = n / FPS
    a0 = ae - d
    out = os.path.join(SEG, name + ".mp4")
    if os.path.exists(out):  # reaproveita segmento já renderizado
        return out, d
    fc = (f"[0:v]trim=duration={d:.4f},setpts=PTS-STARTPTS,{vgrade(a['sat'])}[va];"
          f"[1:v]trim=duration={d:.4f},setpts=PTS-STARTPTS,{vgrade(b['sat'])}[vb];"
          f"[va][vb]xfade=transition=fade:duration={d:.4f}:offset=0,format=yuv420p[v];"
          f"[2:a]atrim={a0:.4f}:{ae:.4f},asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,{AFX}[aa];"
          f"[3:a]atrim={bs:.4f}:{bs + d:.4f},asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,{AFX}[ab];"
          f"[aa][ab]acrossfade=d={d - 0.001:.4f}:c1=tri:c2=tri,atrim=duration={d:.4f}[a]")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a0:.4f}", "-i", src(a["src"]),
         "-ss", f"{bs:.4f}", "-i", src(b["src"]), "-i", wav(a["src"]), "-i", wav(b["src"]),
         "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-frames:v", str(n), *VENC, *AENC, out])
    return out, d


jobs = []  # (order, fn, args)
chs = EDL["chapters"]
for ci, ch in enumerate(chs):
    segs = [list(x) for x in ch["segments"]]
    if ci > 0:
        segs[0][0] += XF
    if ci < len(chs) - 1:
        segs[-1][1] -= XF
    for si, (s, e) in enumerate(segs):
        jobs.append((f"c{ci + 1}_s{si + 1:02d}", plain, (f"c{ci + 1}_s{si + 1:02d}", ch, s, e)))
    if ci < len(chs) - 1:
        nxt = chs[ci + 1]
        jobs.append((f"c{ci + 1}_t", trans, (f"c{ci + 1}_t", ch, ch["segments"][-1][1], nxt, nxt["segments"][0][0])))

jobs.sort(key=lambda j: j[0])
with ThreadPoolExecutor(4) as ex:
    results = list(ex.map(lambda j: j[1](*j[2]), jobs))

vin = os.path.join(ROOT, "edit", "clips_graded", "sth_seg_vinheta.mp4")
lst = os.path.join(ED, "concat_list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for p, _ in results:
        f.write(f"file '{p}'\n")
    f.write(f"file '{vin}'\n")
final = os.path.join(ROOT, "EDITADOS", "bastidores lmc 2 redetv - editado.mp4")
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
     "-movflags", "+faststart", final])
total = sum(d for _, d in results)
print(f"pieces={len(results)} expected={total:.2f}s (+vinheta) -> {final}")
