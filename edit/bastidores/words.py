import json,sys
i,a,b=sys.argv[1],float(sys.argv[2]),float(sys.argv[3])
d=json.load(open(f"transcripts/bastidores lmc 2 - {i}.json",encoding="utf-8"))
print(f"== {i} {a}-{b}: "+" ".join(f"{w['text']}[{w['start']:.2f}-{w['end']:.2f}]" for w in d["words"] if w.get("type")!="spacing" and w["end"]>=a and w["start"]<=b))
