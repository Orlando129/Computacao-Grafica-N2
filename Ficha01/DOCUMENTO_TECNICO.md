# Documento Técnico - Ficha 01

## 1. Arquitetura da Aplicação

### 1.1 Padrão Arquitetural

O projeto utiliza **arquitetura modular** baseada em **separação de responsabilidades** (padrão MVC):

- **Model:** Gerenciamento de dados (pontos de controle, geometria 3D)
- **View:** Renderização (Canvas 2D, Three.js)
- **Controller:** Orquestração e lógica de negócio

### 1.2 Estrutura de Módulos

**Questão 01 - Curvas Paramétricas:**
```
├── main.js              # Controlador principal
├── bezier.js            # Algoritmo de De Casteljau
├── spline.js            # Algoritmo de Cox-de Boor
├── controlPoints.js     # Gerenciamento de pontos
└── renderer.js          # Renderização Canvas 2D
```

**Questão 02 - Superfície de Revolução:**
```
├── main.js              # Controlador principal
├── curve2D.js           # Curvas do perfil (reutiliza Q1)
├── revolution.js        # Geração da superfície 3D
├── renderer3D.js        # Renderização Three.js
└── exporter.js          # Exportação (JSON/OBJ/STL)
```

### 1.3 Fluxo de Dados

**Questão 01:**
```
Usuário → Canvas → ControlPointsManager → Algoritmos → Renderer
```

**Questão 02:**
```
Usuário → Curve2D → RevolutionSurface → Renderer3D → Exporter
```

---

## 2. Algoritmos Implementados

### 2.1 De Casteljau (Curvas de Bézier)

**Formulação matemática:**
$$P_i^r(t) = (1-t) P_i^{r-1}(t) + t \cdot P_{i+1}^{r-1}(t)$$

**Implementação:**
```javascript
function deCasteljau(controlPoints, t) {
    let points = [...controlPoints];
    while (points.length > 1) {
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push({
                x: (1 - t) * points[i].x + t * points[i + 1].x,
                y: (1 - t) * points[i].y + t * points[i + 1].y
            });
        }
        points = newPoints;
    }
    return points[0];
}
```

**NURBS (com pesos):** Utiliza coordenadas homogêneas $(w \cdot x, w \cdot y, w)$ para suportar pesos, aplicando De Casteljau no espaço homogêneo e depois dividindo por $w$.

### 2.2 Cox-de Boor (B-Splines)

**Formulação matemática:**
$$N_{i,p}(t) = \frac{t - u_i}{u_{i+p} - u_i} N_{i,p-1}(t) + \frac{u_{i+p+1} - t}{u_{i+p+1} - u_{i+1}} N_{i+1,p-1}(t)$$

**Implementação:**
```javascript
function bSplineBasis(i, degree, t, knots) {
    if (degree === 0) {
        return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
    }
    
    let left = 0, right = 0;
    const denomLeft = knots[i + degree] - knots[i];
    if (denomLeft !== 0) {
        left = ((t - knots[i]) / denomLeft) * 
               bSplineBasis(i, degree - 1, t, knots);
    }
    
    const denomRight = knots[i + degree + 1] - knots[i + 1];
    if (denomRight !== 0) {
        right = ((knots[i + degree + 1] - t) / denomRight) * 
                bSplineBasis(i + 1, degree - 1, t, knots);
    }
    
    return left + right;
}
```

**Vetor de nós:** Utiliza estrutura **clamped uniform** com multiplicidade $p+1$ nas extremidades, garantindo que a curva interpola o primeiro e último ponto de controle.

### 2.3 Superfície de Revolução

**Rotação de ponto 2D:**

- **Eixo Y:** $x' = r \cos\theta$, $y' = h$, $z' = r \sin\theta$
- **Eixo X:** $x' = h$, $y' = r \cos\theta$, $z' = r \sin\theta$
- **Eixo Z:** $x' = x \cos\theta - y \sin\theta$, $y' = x \sin\theta + y \cos\theta$

**Geração de malha:**
1. Para cada subdivisão angular $\theta$, rotaciona todos os pontos do perfil
2. Conecta anéis adjacentes formando quads
3. Divide cada quad em 2 triângulos

### 2.4 Cálculo de Normais

**Normal de face:** Produto vetorial das arestas
$$\vec{n} = (V_1 - V_0) \times (V_2 - V_0)$$

**Normal por vértice (smooth shading):** Média normalizada das normais das faces adjacentes
$$\vec{N_v} = \frac{\sum_{f \in F_v} \vec{n_f}}{||\sum_{f \in F_v} \vec{n_f}||}$$

---

## 3. Decisões de Projeto

### 3.1 Arquitetura

**Modularização em ES6:**
- **Justificativa:** Facilita manutenção, permite reutilização de código (Questão 02 reutiliza algoritmos da Questão 01), melhora legibilidade
- **Alternativa rejeitada:** Código monolítico

**Orientação a Objetos:**
- **Justificativa:** Encapsula estado e comportamento, facilita múltiplas instâncias
- **Classes principais:** `ControlPointsManager`, `RevolutionSurface`, `Renderer`, `Renderer3D`

### 3.2 Algoritmos

**De Casteljau vs Bernstein:**
- **Escolha:** De Casteljau
- **Justificativa:** Mais estável numericamente, eficiente para graus elevados, fácil extensão para NURBS

**Cox-de Boor Recursivo:**
- **Escolha:** Implementação recursiva
- **Justificativa:** Código legível e próximo da formulação matemática, profundidade limitada (grau máximo 5)

**Vetor de Nós Clamped:**
- **Escolha:** Clamped uniform
- **Justificativa:** Curva interpola extremos, comportamento intuitivo, padrão em CAD

### 3.3 Renderização

**Canvas 2D vs SVG:**
- **Escolha:** Canvas HTML5
- **Justificativa:** Melhor performance, controle total, suporte high-DPI

**Three.js vs WebGL:**
- **Escolha:** Three.js
- **Justificativa:** Abstração reduz complexidade, controles prontos (OrbitControls), foco nos algoritmos matemáticos

**High-DPI Support:**
- **Implementação:** Scaling automático baseado em `devicePixelRatio` para gráficos nítidos em telas Retina/4K

### 3.4 Exportação

**Formatos escolhidos:**
- **JSON:** Formato universal, debug fácil, reedição
- **OBJ:** Padrão de indústria (Blender, Maya, 3ds Max)
- **STL:** Impressão 3D

**Indexação OBJ:**
- **Decisão:** 1-based (padrão Wavefront)
- **Justificativa:** Compatibilidade com especificação, evita erros de importação

### 3.5 Robustez

**Validações implementadas:**
- Proteção contra divisão por zero (Cox-de Boor)
- Validação de perfil (remove pontos muito próximos ao eixo)
- Tratamento de casos extremos (0 pontos, grau > número de pontos)
- Normalização segura de vetores

---

## 4. Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | - | Estrutura |
| CSS3 | - | Estilos e layout |
| JavaScript ES6+ | - | Lógica |
| Canvas API | HTML5 | Renderização 2D |
| Three.js | r128 | Renderização 3D |

---