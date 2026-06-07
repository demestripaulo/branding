# Mente Curada — Curadoria Intelectual

Curadoria do pensamento público de Chris Kumakola para estudo pessoal.
Todos os conteúdos são baseados em material publicado voluntariamente pela autora.

---

## Estrutura do Projeto

```
├── frontend/           → App dark noir (insights diários)
│   ├── index.html      → Página principal
│   └── data/
│       └── insights.json → 35+ insights curados
│
├── vault/              → Vault Obsidian (conhecimento estruturado)
│   ├── 🏠 Home.md
│   ├── 01 - Perfil/
│   ├── 02 - Frameworks/
│   ├── 03 - Insights/
│   ├── 04 - Livros/
│   ├── 05 - Artigos/
│   └── 06 - Curadoria/
│
└── scripts/
    └── collect_content.py → Coleta automática de novos conteúdos
```

---

## 1. App de Insights (Frontend)

### Rodar localmente

```bash
cd frontend
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

### Navegar
- **← →** ou botões para navegar entre insights
- **Espaço** para insight aleatório
- Cada acesso mostra um insight diferente

---

## 2. Vault Obsidian

### Como instalar o Obsidian

1. Baixar em: https://obsidian.md/download
2. Instalar e abrir
3. Clicar em **"Open folder as vault"**
4. Selecionar a pasta `vault/` deste projeto
5. Pronto — o vault abre com tema escuro e toda a estrutura

### O que tem no vault

| Nota | Conteúdo |
|---|---|
| `🏠 Home.md` | Índice principal e status da curadoria |
| `01 - Perfil/Chris Kumakola.md` | Biografia completa, trajetória, expertise |
| `02 - Frameworks/Arquitetura de Narrativa.md` | Framework central da metodologia |
| `02 - Frameworks/Posicionamento de Autoridade.md` | Teoria de autoridade |
| `03 - Insights/Frases e Princípios.md` | 35+ insights organizados por tema |
| `04 - Livros/Livros.md` | Os dois best-sellers |
| `05 - Artigos/Liberdade Individual vs Conformismo.md` | Análise do artigo do Medium |
| `06 - Curadoria/Plano de Estudos.md` | Roteiro de 90 dias |

---

## 3. Coletar mais conteúdo

```bash
pip install requests beautifulsoup4 yt-dlp
python3 scripts/collect_content.py
```

O script busca automaticamente:
- Novos vídeos do YouTube (`@ChrisKumakola`)
- Novos artigos do Medium (`@chriskumakola`)
- Atualiza o vault com os resultados

---

## 4. Adicionar novos insights manualmente

Edite `frontend/data/insights.json` seguindo o padrão:

```json
{
  "id": 36,
  "text": "Texto do insight aqui.",
  "category": "narrativa",
  "source": "YouTube — Nome do Vídeo",
  "type": "quote"
}
```

**Categorias disponíveis:** narrativa, autoridade, posicionamento, autenticidade,
branding, comunicacao, identidade, comportamento, negociacao, autoconhecimento,
mentoria, escrita, performance, experiencia, integridade, reflexao

---

## 5. Próximas etapas planejadas

- [ ] **Notificações mobile** — PWA com service worker para push diário
- [ ] **RAG local** — usar os insights + vault para criar mentor AI privado com Ollama
- [ ] **Transcrições YouTube** — extrair automaticamente com yt-dlp + Whisper
- [ ] **Resumos dos livros** — após aquisição na Amazon

---

## Fontes públicas

- YouTube: https://youtube.com/@ChrisKumakola
- Site: https://chriskumakola.com
- Medium: https://medium.com/@chriskumakola
- Linktree: https://linktr.ee/chriskumakola
- Podcast (aparição): CEOTV Podcast Ep. 74
