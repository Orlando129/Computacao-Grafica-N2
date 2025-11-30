# Computação Gráfica - N2

Este projeto contém implementações de simulações interativas utilizando diferentes tecnologias (HTML, CSS, Javascript, Three.js e Processing) para demonstrar conceitos de computação gráfica.

## 👨‍💻 Autores

**Luiz Belispetre, João Lucas Camilo, Orlando Telles da Silva Batista**
- GitHub: [@Luiz](https://github.com/K4L1B3)
          [@João](https://github.com/joaolucascamilo)
          [@Orlando](https://github.com/Orlando129)
- Projeto: Computação Gráfica - Avaliação N1

**Visão geral rápida**
- Ficha 01: Experimentos com curvas, Bézier e renderização 2D/3D em JavaScript.
- Ficha 02: Projeto em Processing (`ligeirinho`) com animação/recursos na pasta `Ficha02/ligeirinho`.

**Pré-requisitos**
- Navegador moderno com suporte a WebGL (Chrome, Firefox, Edge).
- `node` / `npm` (opcional, para servidores locais como `http-server`).
- `python3` (opcional, para servidor HTTP simples).
- Processing IDE (para abrir e executar o sketch `.pde`).

**Como executar (rápido)**

- Servir as páginas web (Ficha01)
   - Com `http-server` (recomendado):
      ```bash
      # a partir da raiz do projeto
      npx http-server -p 5500
      ```
      Em seguida abra no navegador:
      - `http://localhost:5500/Ficha01/Questao01/html/`  (Questão 01)
      - `http://localhost:5500/Ficha01/Questao02/html/`  (Questão 02)

   - Alternativa com Python (sem instalar npm):
      ```bash
      # a partir da raiz do projeto
      python3 -m http.server 5500
      ```

- Executar o sketch Processing (Ficha02)
   - Abra `Ficha02/ligeirinho/ligeirinho.pde` no Processing IDE e clique em Run.
   - Ou, se você tem `processing-java` no PATH:
      ```bash
      processing-java --sketch=Ficha02/ligeirinho --run
      ```

**Estrutura do projeto (resumida)**
- `Ficha01/`
   - `Questao01/`
      - `html/index.html` — demo principal (2D/curvas)
      - `js/` — `bezier.js`, `spline.js`, `controlPoints.js`, `renderer.js`, `main.js`
      - `css/styles.css`
   - `Questao02/`
      - `html/index.html` — demo de revolução/3D
      - `js/` — `curve2D.js`, `revolution.js`, `renderer3D.js`, `main.js`, `exporter.js`
      - `css/styles.css`
- `Ficha02/`
   - `ligeirinho/`
      - `ligeirinho.pde` — sketch Processing
      - `data/` — arquivos de dados usados pelo sketch
      - `DOCUMENTO_TECNICO.md`

**Notas e dicas**
- Sempre sirva arquivos estáticos por um servidor (não abra o `index.html` diretamente), pois alguns navegadores bloqueiam requisições locais relacionadas a módulos e recursos.
- Se quiser inspecionar a lógica das curvas, abra os arquivos em `Ficha01/Questao01/js/` e `Ficha01/Questao02/js/`.
- Para desenvolvimento rápido, use `npx http-server` (não precisa instalar globalmente).

**Contribuição / Execução local**
- Clone o repositório e rode o servidor local:
   ```bash
   git clone <URL-do-repositório>
   cd Computacao-Grafica-N2
   npx http-server -p 5500
   ```

---