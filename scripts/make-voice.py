#!/usr/bin/env python3
"""Records the investor demo's narration with Kokoro (open source, Apache-2.0), British voice "Emma".

Writes public/voice/<key>.mp3 for every line in lib/voice-lines.js (the film's spoken lines plus the
"Test voice" line), so the demo has a natural narrator with no account or API key. Run it again
whenever lib/demo-film.js changes; tests/voice-files.test.mjs fails until every line has a file.

  python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile lameenc
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  node --import ./tests/setup/register.mjs scripts/export-voice-lines.mjs > /tmp/lines.json
  .venv/bin/python scripts/make-voice.py /tmp/lines.json [model dir]
"""
import json, os, sys
import numpy as np
import lameenc
from kokoro_onnx import Kokoro

VOICE, SPEED, LANG = "bf_emma", 0.95, "en-gb"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "voice")


def mp3(samples, rate):
    pad = np.zeros(int(rate * 0.12), dtype=np.float32)  # a breath of silence either side
    pcm = (np.clip(np.concatenate([pad, samples, pad]), -1, 1) * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(96)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm.tobytes()) + enc.flush()


def main():
    lines = json.load(open(sys.argv[1]))
    model_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    os.makedirs(OUT, exist_ok=True)
    keep = set()
    for key, text in lines.items():
        path = os.path.join(OUT, key + ".mp3")
        keep.add(key + ".mp3")
        if os.path.exists(path):
            continue
        samples, rate = kokoro.create(text, voice=VOICE, speed=SPEED, lang=LANG)
        with open(path, "wb") as f:
            f.write(mp3(samples, rate))
        print(key, round(len(samples) / rate, 1), "s", text[:60])
    for name in os.listdir(OUT):  # lines no longer in the film
        if name.endswith(".mp3") and name not in keep:
            os.remove(os.path.join(OUT, name))
            print("removed", name)


if __name__ == "__main__":
    main()
