import pdfplumber
import re
import json
import os

PDF_PATH = r"c:\Mes Sites Web\Site_web_PROQUELEC-main\public\docs\NS01001\NS_01_001.pdf.pdf"
OUT_DIR = r"c:\Mes Sites Web\Site_web_PROQUELEC-main\public\docs\NS01001\NS01001_extracts_v2"
os.makedirs(OUT_DIR, exist_ok=True)

# ------------------ REGEX PATTERNS ------------------
TITRE_PATTERN = re.compile(r"^(TITRE|ANNEXE)\s+([0-9A-Z]+)\s*[-–]?\s*(.*)$", re.IGNORECASE)
RULE_HEADER_PATTERN = re.compile(r"^([H]?)\s*([A-Z]\.?\d+(?:\.\d+)*|\d{2,}(?:\.\d+)*)\s+(.*)$")

# ------------------ UTIL FUNCTIONS ------------------
def clean_text(text):
    if not text: return ""
    text = re.sub(r"\(cid:\d+\)", "", text)
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def is_toc_line(line):
    return "...." in line

def save_rule(rules_list, titre, article, buffer, page):
    if not buffer or not article: return
    full_text = clean_text(" ".join(buffer))
    if len(full_text) < 5: return
    rule = {
        "id": f"NS01-001-{article.replace(' ', '-')}",
        "titre": titre,
        "article": article,
        "content": full_text,
        "page": page
    }
    rules_list.append(rule)

# ------------------ EXTRACTION ------------------
print("🚀 Starting Improved Audit & Extraction v2...")

rules = []
current_titre = ""
current_article = ""
current_buffer = []
current_page = 0
inside_normative_body = False

with pdfplumber.open(PDF_PATH) as pdf:
    for page_num, page in enumerate(pdf.pages, 1):
        if page_num < 21: continue # Skip preamble/TOC
        text = page.extract_text()
        if not text: continue
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # Detect TITRE
            t_match = TITRE_PATTERN.match(line)
            if t_match and not is_toc_line(line):
                save_rule(rules, current_titre, current_article, current_buffer, current_page)
                current_buffer = []
                current_titre = f"{t_match.group(1).upper()} {t_match.group(2)} - {t_match.group(3)}"
                current_article = f"{t_match.group(1).upper()}-{t_match.group(2)}" # Boundary article
                current_page = page_num
                inside_normative_body = True
                continue
            
            if not inside_normative_body: continue
            
            # Detect Rules
            h_match = RULE_HEADER_PATTERN.match(line)
            if h_match and len(line) < 200:
                save_rule(rules, current_titre, current_article, current_buffer, current_page)
                current_article = f"{h_match.group(1)}{h_match.group(2)}".strip()
                current_buffer = [h_match.group(3)]
                current_page = page_num
                continue
            
            current_buffer.append(line)

save_rule(rules, current_titre, current_article, current_buffer, current_page)

# Save results
output_path = os.path.join(OUT_DIR, "NS01001_v2_core.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(rules, f, ensure_ascii=False, indent=2)

print(f"✅ Extraction complete. rules count: {len(rules)}")
if rules:
    print(f"Audit Result: Rules start at page {rules[0]['page']} and end at page {rules[-1]['page']}")
else:
    print("❌ No rules found. Check your patterns.")
