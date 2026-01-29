import pdfplumber

pdf_path = r"c:\Mes Sites Web\Site_web_PROQUELEC-main\public\docs\NS01001\Norme NS 01-001.pdf"

with pdfplumber.open(pdf_path) as pdf:
    text = ""
    for page in pdf.pages:
        text += page.extract_text() + "\n"

with open(r"c:\Mes Sites Web\Site_web_PROQUELEC-main\extracted_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Texte extrait et sauvegardé dans extracted_text.txt")