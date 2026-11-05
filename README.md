# Conferência de Conexões GD

Ferramenta web para conferir conexões de **Geração Distribuída (GD) do Grupo A** antes da vistoria em campo.

O usuário carrega a **Nota de Serviço (SS)** e os **diagramas do projeto**. A ferramenta extrai os dados dos dois e cruza as informações. No fim, gera um **relatório para o fiscal**, com as divergências encontradas e um checklist de conferência em campo.

Executiva de Perdas Sul e Sudoeste — Equatorial Energia Goiás.

---

## Como usar

1. Abra a ferramenta (veja [Como abrir](#como-abrir)) e clique em **+ Nova conexão**.
2. **Arquivos** — arraste a SS, as pranchas do projeto e demais arquivos (PDF ou imagem). A SS é reconhecida automaticamente.
3. **Dados da SS** — campos preenchidos automaticamente (em verde). Revise.
4. **Dados do projeto** — o diagrama aparece ao lado do formulário. Um aviso mostra quantos campos foram encontrados e quais faltam. Os que faltarem podem ser preenchidos olhando o desenho ou pelo botão **Ler por OCR**.
5. **Cruzamento** — lista de alertas:
   - 🔴 **Divergência** — a SS e o projeto não batem
   - 🟠 **Conferir** — ponto que precisa de verificação em campo
   - ⚪ **Obs.** — informação de registro
   - 🟢 **OK** — confere

   Também é possível incluir observações manuais.
6. **Relatório** — imprima, salve em PDF ou baixe em `.html` para enviar ao fiscal.

Os dados extraídos ficam salvos no navegador (localStorage). Os PDFs não ficam salvos. Use **Exportar backup** para levar os cadastros para outro computador.

## Como abrir

| Forma | Como |
|---|---|
| **Arquivo único** | Baixe `dist/conferencia-gd.html` e abra no Chrome ou no Edge. |
| **GitHub Pages** | Em *Settings → Pages*, escolha a branch `main`, pasta `/ (root)`. A ferramenta fica em `https://<usuario>.github.io/<repositorio>/`. |
| **Local, a partir do código** | Abra `index.html` no navegador. |

> É preciso **internet**, porque a leitura de PDF (pdf.js) e o OCR (tesseract.js) são carregados de CDN.

## O que a ferramenta confere

| Regra | Alerta |
|---|---|
| Relação dos TCs: SS × projeto (com cálculo da RTC) | Divergência |
| Potência do transformador e tensões primária/secundária | Divergência |
| Tensão de medição ≤ 127 V no cadastro com medição indireta em BT | Conferir |
| Modelo do inversor diferente entre folhas do projeto | Divergência |
| Disjuntor geral com dois valores no projeto / muito acima da corrente do trafo | Divergência / Conferir |
| Número da UC (mesmo número, formato diferente ou outro código) | OK / Conferir / Divergência |
| Cliente e município | Conferir |
| Medidor: bidirecional a instalar, existente, ambíguo, 4 quadrantes | Conferir / OK |
| Módulos × potência unitária = kWp declarado | Divergência |
| Soma das strings = quantidade de módulos | Divergência |
| Potência C.A. maior que o trafo | Divergência |
| Relação C.C./C.A. > 1,5 | Conferir |
| Gerador auxiliar / chave reversora | Conferir |
| Micro (≤ 75 kW) ou minigeração (> 75 kW) | Obs. |
| Placas de advertência não especificadas | Conferir |

## Estrutura do projeto

```
├── index.html               # página da ferramenta
├── css/estilo.css           # estilos da interface e do relatório
├── js/
│   ├── util.js              # utilitários, estado e armazenamento
│   ├── campos.js            # campos da SS e do projeto
│   ├── leitura-ss.js        # leitura da SS
│   ├── leitura-projeto.js   # leitura dos diagramas (texto ou OCR)
│   ├── cruzamento.js        # regras de cruzamento SS × projeto
│   ├── relatorio.js         # relatório do fiscal
│   ├── app.js               # interface (abas, arquivos, visualizador, OCR)
│   └── logo.js              # logo embutida (relatório em .html)
├── assets/logo-equatorial.png
├── tests/                   # testes automáticos + textos de exemplo anonimizados
├── build.py                 # gera dist/conferencia-gd.html
└── dist/conferencia-gd.html # versão em arquivo único
```

## Manutenção

**Projetista com formato novo de prancha:** quando um campo não é lido, acrescente o padrão em `js/leitura-projeto.js`. Para conferir se nada quebrou:

```bash
node --test tests/*.test.js
```

Para incluir um caso novo nos testes, salve o texto extraído em `tests/fixtures/`, **trocando nomes, CPF/CNPJ, UC, telefones e endereços por dados fictícios**.

**Depois de qualquer alteração**, gere de novo o arquivo único:

```bash
python3 build.py
```

## Privacidade

- Não suba SS, projetos ou backups (`.json`) de clientes reais no repositório. O `.gitignore` já bloqueia PDFs e backups.
- Recomenda-se manter o repositório **privado**: ele contém a marca da empresa e regras internas de conferência.

## Limitações conhecidas

- Diagramas desenhados em CAD em que o texto virou linhas, e tabelas inseridas como imagem, só são lidos por OCR. O OCR é um recurso em teste: confira os campos em verde.
- Cada projetista monta a prancha de um jeito. A leitura cobre os formatos já vistos, e os campos que não forem lidos aparecem no aviso da aba 3.
