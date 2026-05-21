#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genere des embeddings pour train/chunks.jsonl (OpenAI).

Usage:
  set OPENAI_API_KEY=...
  python embed_chunks.py
"""

import json
import os
from pathlib import Path

try:
    from openai import OpenAI
except Exception as exc:
    raise SystemExit(f"OpenAI SDK missing: {exc!r}")


MODEL = "text-embedding-3-large"


def main():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("OPENAI_API_KEY is required.")

    client = OpenAI(api_key=api_key)

    root = Path(__file__).resolve().parent
    chunks_path = root / "train" / "chunks.jsonl"
    emb_path = root / "train" / "chunks_embeddings.jsonl"

    with chunks_path.open("r", encoding="utf-8") as f_in, emb_path.open("w", encoding="utf-8") as f_out:
        for line in f_in:
            item = json.loads(line)
            text = item.get("text", "")
            if not text:
                continue

            response = client.embeddings.create(
                model=MODEL,
                input=text
            )
            embedding = response.data[0].embedding
            f_out.write(json.dumps({**item, "embedding": embedding}, ensure_ascii=False) + "\n")

    print("OK")


if __name__ == "__main__":
    main()
