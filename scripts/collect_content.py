"""
Coleta conteúdo público de Chris Kumakola e atualiza o vault Obsidian.
Requer: pip install requests beautifulsoup4 yt-dlp
"""

import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

VAULT = Path(__file__).parent.parent / "vault"
INSIGHTS_FILE = Path(__file__).parent.parent / "frontend" / "data" / "insights.json"
SOURCES = {
    "medium":  "https://medium.com/@chriskumakola",
    "website": "https://chriskumakola.com",
    "youtube": "https://www.youtube.com/@ChrisKumakola",
    "threads": "https://www.threads.com/@chriskumakola",
}


def load_insights() -> list[dict]:
    with open(INSIGHTS_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_insights(data: list[dict]) -> None:
    with open(INSIGHTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[✓] {len(data)} insights salvos em insights.json")


def add_insight(text: str, category: str, source: str, insight_type: str = "principio") -> None:
    """Adiciona um novo insight ao arquivo JSON."""
    insights = load_insights()
    next_id = max(i["id"] for i in insights) + 1

    new_insight = {
        "id": next_id,
        "text": text.strip(),
        "category": category,
        "source": source,
        "type": insight_type,
        "date_added": datetime.now().strftime("%Y-%m-%d"),
    }
    insights.append(new_insight)
    save_insights(insights)
    print(f"[+] Insight #{next_id} adicionado: {text[:60]}...")


def fetch_youtube_titles() -> list[str]:
    """Lista títulos de vídeos públicos do canal (requer yt-dlp)."""
    try:
        import subprocess
        result = subprocess.run(
            ["yt-dlp", "--flat-playlist", "--get-title", SOURCES["youtube"]],
            capture_output=True, text=True, timeout=60
        )
        titles = [t.strip() for t in result.stdout.split("\n") if t.strip()]
        print(f"[✓] {len(titles)} vídeos encontrados no YouTube")
        return titles
    except FileNotFoundError:
        print("[!] yt-dlp não instalado. Execute: pip install yt-dlp")
        return []
    except Exception as e:
        print(f"[!] Erro ao buscar YouTube: {e}")
        return []


def save_youtube_index(titles: list[str]) -> None:
    """Salva índice de vídeos como nota no vault."""
    if not titles:
        return

    content = "# Vídeos do YouTube — Chris Kumakola\n\n"
    content += f"*Coletado em: {datetime.now().strftime('%Y-%m-%d')}*\n\n"
    content += f"Total: {len(titles)} vídeos\n\n---\n\n"
    for i, title in enumerate(titles, 1):
        content += f"- [ ] {i:03d}. {title}\n"

    out = VAULT / "06 - Curadoria" / "YouTube — Índice de Vídeos.md"
    out.write_text(content, encoding="utf-8")
    print(f"[✓] Índice de vídeos salvo em: {out.name}")


def fetch_medium_articles() -> None:
    """Busca artigos públicos do Medium (requer requests + bs4)."""
    try:
        import requests
        from bs4 import BeautifulSoup

        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(SOURCES["medium"], headers=headers, timeout=15)
        soup = BeautifulSoup(r.text, "html.parser")

        articles = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "/p/" in href or ("medium.com" in href and "@chriskumakola" in href):
                title = a.get_text(strip=True)
                if len(title) > 20:
                    articles.append({"title": title, "url": href})

        if articles:
            print(f"[✓] {len(articles)} artigos encontrados no Medium")
            content = "# Artigos do Medium — Chris Kumakola\n\n"
            content += f"*Coletado em: {datetime.now().strftime('%Y-%m-%d')}*\n\n"
            for art in articles:
                content += f"- [ ] [{art['title']}]({art['url']})\n"
            out = VAULT / "05 - Artigos" / "Medium — Índice.md"
            out.write_text(content, encoding="utf-8")
        else:
            print("[!] Nenhum artigo encontrado no Medium (pode requerer login)")

    except ImportError:
        print("[!] requests/beautifulsoup4 não instalado. Execute: pip install requests beautifulsoup4")
    except Exception as e:
        print(f"[!] Erro ao buscar Medium: {e}")


def update_vault_timestamp() -> None:
    """Atualiza timestamp na nota Home."""
    home = VAULT / "🏠 Home.md"
    if home.exists():
        text = home.read_text(encoding="utf-8")
        today = datetime.now().strftime("%Y-%m-%d")
        text = re.sub(r"\*Última atualização:.*\*", f"*Última atualização: {today}*", text)
        home.write_text(text, encoding="utf-8")


def main():
    print("=" * 50)
    print("  Coletor de Conteúdo — Chris Kumakola")
    print("=" * 50)

    print("\n[1/3] Buscando vídeos do YouTube...")
    titles = fetch_youtube_titles()
    save_youtube_index(titles)

    print("\n[2/3] Buscando artigos do Medium...")
    fetch_medium_articles()

    print("\n[3/3] Atualizando vault...")
    update_vault_timestamp()

    print("\n✓ Coleta concluída.")
    print(f"  Vault: {VAULT}")
    print(f"  Insights: {len(load_insights())} registros")


if __name__ == "__main__":
    main()
