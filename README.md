# Computação Gráfica - N2

Este projeto contém implementações de simulações interativas utilizando diferentes tecnologias (HTML, CSS, Javascript, Three.js e Processing) para demonstrar conceitos de computação gráfica, incluindo curvas de Bézier, superfícies de revolução e animações interativas.

## 👨‍💻 Autores

**Luiz Belispetre, João Lucas Camilo, Orlando Telles da Silva Batista**
- GitHub: [@Luiz](https://github.com/K4L1B3)
          [@João](https://github.com/joaolucascamilo)
          [@Orlando](https://github.com/Orlando129)
- Projeto: Computação Gráfica - Avaliação N2

## 🛠️ Pré-requisitos

- **Live Server** (para servidor HTTP local - questões JavaScript/Three.js)
- **Processing** (para executar as questões da Ficha 02)
- **Navegador moderno** com suporte a WebGL

## 🚀 Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/Orlando129/Computacao-Grafica-N2.git
cd Computacao-Grafica-N2
```

### 2. Execute o projeto

#### Questões da Ficha 01 (JavaScript/Three.js)

**Método 1: Live Server**

1. Baixa a extensão do Live server e Execute-a no HTML

**Método 2: Servidor HTTP Local**

1. Instale o http-server globalmente (se ainda não instalado):
   ```bash
   npm install -g http-server
   ```

2. Na raiz do projeto, inicie o servidor HTTP:
   ```bash
   npx http-server -p 5500
   ```
   
   Ou se instalado globalmente:
   ```bash
   http-server -p 5500
   ```

3. Abra o navegador e acesse:
   - **Questão 01**: http://localhost:5500/Ficha01/Questao01/html/
   - **Questão 02**: http://localhost:5500/Ficha01/Questao02/html/

**Método 3: Servidor Python (Alternativa)**

```bash
python3 -m http.server 5500
```

Depois acesse: http://localhost:5500

#### Questões da Ficha 02 (Processing)
Abra o arquivo `.pde` no Processing IDE:
- **Ligeirinho**: `Ficha02/ligeirinho/ligeirinho.pde`

Ou execute via linha de comando (se o Processing estiver no PATH):
```bash
processing-java --sketch=Ficha02/ligeirinho --run
```

## 📊 Estrutura do Projeto

```
Computacao-Grafica-N2/
├── Ficha01/                     # Questões JavaScript/Three.js da Ficha 01
│   ├── Questao01/               # Curvas de Bézier e Splines
│   │   ├── html/
│   │   │   └── index.html       # Interface principal
│   │   ├── js/
│   │   │   ├── bezier.js        # Implementação de curvas de Bézier
│   │   │   ├── spline.js        # Implementação de splines
│   │   │   ├── controlPoints.js # Controle de pontos
│   │   │   ├── renderer.js      # Renderização 2D
│   │   │   └── main.js          # Lógica principal
│   │   └── css/
│   │       └── styles.css       # Estilos da interface
│   ├── Questao02/               # Superfície de Revolução 3D
│   │   ├── html/
│   │   │   └── index.html       # Interface principal
│   │   ├── js/
│   │   │   ├── curve2D.js       # Curva 2D base
│   │   │   ├── revolution.js    # Geração de superfície de revolução
│   │   │   ├── renderer3D.js    # Renderização 3D com Three.js
│   │   │   ├── exporter.js      # Exportação de modelos
│   │   │   └── main.js          # Lógica principal
│   │   └── css/
│   │       └── styles.css       # Estilos da interface
│   └── DOCUMENTO_TECNICO.md     # Documentação técnica
├── Ficha02/                     # Questões Processing da Ficha 02
│   └── ligeirinho/              # Projeto Ligeirinho
│       ├── ligeirinho.pde       # Sketch principal
│       ├── data/                # Recursos (imagens, etc.)
│       └── DOCUMENTO_TECNICO.md # Documentação técnica
├── .gitignore                   # Arquivos ignorados pelo Git
└── README.md                    # Este arquivo
```

## 🔧 Dependências

### JavaScript/Three.js (Ficha 01)
- **Three.js**: Biblioteca JavaScript para renderização 3D (incluída via CDN nos arquivos HTML)
- **Servidor HTTP**: Node.js com http-server ou Live Server

### Processing (Ficha 02)
- **Processing IDE**: Ambiente de desenvolvimento para linguagem Processing
- **processing-java**: CLI para execução via linha de comando (opcional)

---

**Nota**: Este projeto foi desenvolvido como parte da avaliação N2 da disciplina de Computação Gráfica, demonstrando a implementação prática de conceitos de curvas paramétricas, superfícies de revolução e animações interativas.