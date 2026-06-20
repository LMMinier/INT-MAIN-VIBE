import json, re
fps=30; PAD=0.5
CHAPTERS={
 1:"HISPANIOLA",2:"HOW TO READ THIS",3:"BEFORE 1492 · THE TAÍNO WORLD",
 4:"1492–1550 · CONQUEST",5:"1697 · THE CUT",6:"1700s · THE PEARL OF THE ANTILLES",
 7:"THE ENGINE OF COLORISM",8:"1791–1794 · REVOLUTION",9:"1802–1804 · INDEPENDENCE",
 10:"1804–1862 · QUARANTINE",11:"1825 · THE RANSOM",12:"1821–1844 · ONE ISLAND, HAITIAN RULE",
 13:"1838–1844 · THE DOMINICAN FOUNDING",14:"SETTING THE RECORD STRAIGHT",
 15:"20TH CENTURY · THE STRONGMEN",16:"OCTOBER 1937 · EL CORTE",17:"1915–1934 · OCCUPATION",
 18:"THE DIVERGENCE",19:"DOCUMENTED VS. CONTESTED",20:"2004–2026 · THE UNRAVELING",
 21:"THE DEFINITIVE ANSWER",22:"WHAT SURVIVED",
}
def split_caps(text):
    # sentence split, then break long pieces at commas/semicolons to ~max 64 chars
    parts=re.split(r'(?<=[.;])\s+', text.strip())
    caps=[]
    for p in parts:
        p=p.strip()
        if not p: continue
        if len(p)<=70:
            caps.append(p)
        else:
            # break at commas
            sub=re.split(r'(?<=,)\s+', p)
            cur=""
            for s in sub:
                if len(cur)+len(s)+1<=70:
                    cur=(cur+" "+s).strip()
                else:
                    if cur: caps.append(cur)
                    cur=s
            if cur: caps.append(cur)
    return caps

narr={s["n"]:s["text"] for s in json.load(open("narration.json"))["slides"]}
dur={d["n"]:d["dur"] for d in json.load(open("audio/durations.json"))}
slides=[]
for n in sorted(narr):
    spoken=dur[n]                      # seconds of speech
    total=spoken+PAD
    frames=round(total*fps)
    spoken_frames=round(spoken*fps)
    caps=split_caps(narr[n])
    weights=[max(len(c),8) for c in caps]; W=sum(weights)
    cues=[]; acc=0
    for c,w in zip(caps,weights):
        seg=round(spoken_frames*w/W)
        cues.append({"text":c,"from":acc,"durationInFrames":seg})
        acc+=seg
    # extend last cue to fill spoken portion
    if cues: cues[-1]["durationInFrames"]=max(1,spoken_frames-cues[-1]["from"])
    slides.append({"n":n,"img":f"slide-{n:02d}.png","audio":f"slide-{n:02d}.wav",
                   "durationInFrames":frames,"chapter":CHAPTERS[n],"subtitles":cues})
tot=sum(s["durationInFrames"] for s in slides)
json.dump({"fps":fps,"width":1920,"height":1080,"slides":slides,"totalFrames":tot},
          open("remotion/src/manifest.json","w"),indent=2)
print("slides",len(slides),"total",tot,"frames =",round(tot/fps),"s =",round(tot/fps/60,2),"min")
print("sample caps slide1:",[c['text'][:40] for c in slides[0]['subtitles']])
