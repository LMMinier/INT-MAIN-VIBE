import json, subprocess, wave, os
data=json.load(open("narration.json"))
model="voices/en-us-ryan-high.onnx"
os.makedirs("audio", exist_ok=True)
meta=[]
for s in data["slides"]:
    n=s["n"]; text=s["text"]
    out=f"audio/slide-{n:02d}.wav"
    p=subprocess.run(["piper","--model",model,"--output_file",out],
                     input=text.encode(), capture_output=True)
    if not os.path.exists(out) or os.path.getsize(out)<1000:
        print(f"SLIDE {n} FAILED:", p.stderr.decode()[-300:]); continue
    with wave.open(out) as w:
        dur=w.getnframes()/w.getframerate()
    meta.append({"n":n,"file":out,"dur":round(dur,3),"words":len(text.split())})
    print(f"slide {n:2d}: {dur:6.2f}s  ({len(text.split())} words)")
json.dump(meta, open("audio/durations.json","w"), indent=2)
print("TOTAL:", round(sum(m['dur'] for m in meta),1), "s  /", len(meta), "clips")
