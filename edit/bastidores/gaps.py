import json,sys
for i in range(1,5):
    d=json.load(open(f"transcripts/bastidores lmc 2 - {i}.json",encoding="utf-8"))
    ws=[w for w in d["words"] if w.get("type")=="word"]
    print(f"== {i}")
    prev=None
    for w in ws:
        if prev and w["start"]-prev["end"]>=0.6:
            print(f"  gap {prev['end']:.2f}->{w['start']:.2f} ({w['start']-prev['end']:.2f}) after '{prev['text']}' before '{w['text']}'")
        prev=w
