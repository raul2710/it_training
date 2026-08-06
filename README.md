# IT Training

Site estático para responder questionários das aulas (treinamento de TI). Construído com **Vite + HTML + CSS + JavaScript (ES6 Modules)**, sem React e sem framework frontend.

- Sem login, banco de dados ou backend.
- O nome do aluno é pedido no início da sessão e armazenado em `sessionStorage`.
- Fechar a aba ou o navegador apaga automaticamente todos os dados da sessão.

## Como rodar

```bash
npm install
npm run dev       # desenvolvimento
```

## Build de produção

```bash
npm run build     # gera a pasta dist/ pronta para publicação
npm run preview   # pré-visualiza o build localmente
```

Para publicar no **GitHub Pages**: basta enviar o repositório para o GitHub e usar a Action incluída em `.github/workflows/deploy.yml` (habilite *Settings > Pages > Source: GitHub Actions*). O deploy é automático a cada push na branch `main`.

## Estrutura

```
src/
├── assets/            # imagens e ícones SVG
│   ├── images/
│   └── icons/
├── css/               # folhas de estilo organizadas por responsabilidade
│   ├── variables.css
│   ├── global.css
│   ├── layout.css
│   ├── quiz.css
│   ├── responsive.css
│   └── animations.css
├── data/              # uma aula = um arquivo JSON
│   ├── aula01.json
│   ├── aula02.json
│   └── aula03.json
├── js/
│   ├── app.js
│   ├── router.js
│   ├── storage.js
│   ├── utils.js
│   ├── icons.js
│   ├── components/
│   │   ├── header.js
│   │   ├── sidebar.js
│   │   ├── progress.js
│   │   └── modal.js
│   ├── pages/
│   │   ├── home.js
│   │   ├── lessons.js
│   │   ├── quiz.js
│   │   └── result.js
│   └── quiz/
│       ├── quizEngine.js
│       ├── timer.js
│       └── score.js
└── index.html
```

## Adicionar novas aulas (escalável)

Crie um novo arquivo na pasta `src/data/`, por exemplo `aula04.json`. O projeto **carrega automaticamente** todos os `*.json` da pasta via `import.meta.glob`, sem alterar nenhuma lógica. Nenhuma outra mudança é necessária.

```json
{
  "titulo": "Aula 04",
  "descricao": "Novo conteúdo",
  "tempo": 15,
  "dificuldade": "Média",
  "modulo": "Módulo 1 — Fundamentos",
  "perguntas": [
    {
      "id": 1,
      "pergunta": "Pergunta",
      "alternativas": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correta": 0,
      "explicacao": "Explicação da resposta."
    }
  ]
}
```

- `correta` é o índice (0-based) da alternativa correta.
- `dificuldade` aceita `"Fácil"`, `"Média"` ou `"Difícil"` e é usada no badge e no filtro da tela de aulas.
- `modulo` agrupa as aulas em "cards" expansíveis (acordeão). Aulas com o mesmo `modulo` ficam juntas; a ordem dos módulos segue o número no nome.
- Perguntas e alternativas são embaralhadas a cada início de questionário.

## Funcionalidades

- Embaralhar perguntas e alternativas
- Aulas organizadas por módulos (cards expansíveis)
- Filtro por dificuldade (Fácil, Média, Difícil) na tela de aulas
- Cronômetro (tempo decorrido) e tempo estimado por aula
- Barra de progresso
- Pesquisa por aula
- Tema claro/escuro (com persistência da preferência)
- Layout responsivo com barra lateral recolhível
- Atalhos de teclado no questionário (teclas `1-9`, `Enter`, setas)
- Indicador visual das respostas e animações leves
- Acessibilidade (roles, aria, foco visível, reduzir movimento)

## Personalizar a logo

A logo é centralizada em `src/js/branding.js` e exibida na tela inicial, no cabeçalho e na barra lateral.

1. Substitua `src/assets/images/logo.svg` pela sua imagem (PNG ou SVG).
2. Se usar outra extensão/nome, atualize o caminho no import de `src/js/branding.js`.
3. O nome do sistema também é definido ali (campo `name`).

O favicon é `src/assets/icons/favicon.svg` (substitua pelo seu ícone se desejar).

## Converter exercícios em PDF em aulas do site

O material-fonte (PDFs) fica na pasta `Aulas_Exercicios/`, que está no `.gitignore` e não é enviada ao repositório.

Para converter os exercícios de um módulo para o formato JSON do site:

1. Extraia o texto dos PDFs:
   ```bash
   pip install pypdf
   python scripts/extract_pdfs.py "Aulas_Exercicios/ExerciciosModulo1" "algum/dir/de/saida"
   ```
2. Revise o texto extraído e crie/atualize os arquivos em `src/data/` com as perguntas de múltipla escolha (`perguntas`, `alternativas`, `correta`, `explicacao`).
3. Valide e publique:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" src/data/meu_arquivo.json
   npm run build
   ```

Obs.: Quando o PDF contém apenas exercícios dissertativos (sem alternativas/gabarito), é preciso transformá-los em questões de múltipla escolha manualmente, já que o formato do site é de questionário com nota.