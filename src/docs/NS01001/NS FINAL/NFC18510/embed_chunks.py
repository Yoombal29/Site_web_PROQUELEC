#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pathlib import Path

# Placeholder: integrate your embeddings provider here.
# This script reads train/chunks.jsonl and writes train/chunks_embeddings.jsonl

root = Path(__file__).resolve().parent
chunks_path = root / 'train' / 'chunks.jsonl'
emb_path = root / 'train' / 'chunks_embeddings.jsonl'

with chunks_path.open('r', encoding='utf-8') as f_in, emb_path.open('w', encoding='utf-8') as f_out:
    for line in f_in:
        item = json.loads(line)
        text = item.get('text', '')
        # TODO: replace with real embeddings
        embedding = [0.0] * 8
        f_out.write(json.dumps({**item, 'embedding': embedding}, ensure_ascii=False) + '
')

print('OK')
