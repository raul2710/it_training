"""Extrai o texto de PDFs de exercícios para arquivos .txt.

Uso:
    python scripts/extract_pdfs.py <pasta_com_pdfs> [pasta_de_saida]

Exemplo:
    python scripts/extract_pdfs.py "Aulas_Exercicios/ExerciciosModulo1"
"""

import sys
from pathlib import Path

from pypdf import PdfReader


def extract(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n\n--- PÁGINA ---\n\n".join(pages)


def main() -> None:
    if len(sys.argv) < 2:
        print("Informe a pasta com os PDFs.")
        sys.exit(1)

    source = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else source / "_extracoes"
    out_dir.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(source.glob("*.pdf"))
    if not pdfs:
        print(f"Nenhum PDF encontrado em {source}")
        sys.exit(1)

    for pdf in pdfs:
        text = extract(pdf)
        target = out_dir / f"{pdf.stem}.txt"
        target.write_text(text, encoding="utf-8")
        pages = len(PdfReader(str(pdf)).pages)
        chars = len(text)
        status = "OK" if chars > 0 else "SEM TEXTO (pode ser imagem)"
        print(f"[{status}] {pdf.name} -> {target.name} ({pages} pág, {chars} chars)")

    print(f"\nExtrações salvas em: {out_dir}")


if __name__ == "__main__":
    main()
