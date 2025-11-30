# Documento Técnico – Ligeirinho.pde

## 1. Arquitetura da Aplicação

### 1.1 Padrão Arquitetural
O projeto segue uma **arquitetura procedural estruturada**, típica de aplicações desenvolvidas em Processing, organizada em três partes principais:

- **setup()** – Inicialização do mundo, carregamento de sprites e configuração da janela.
- **draw()** – Loop do jogo: atualização contínua da lógica e renderização.
- **Funções Auxiliares** – Organização por responsabilidades específicas (movimento, animação, câmera, iluminação, etc.).

---

## 1.2 Estrutura de Módulos Lógicos

Mesmo sendo um único arquivo `.pde`, o código se divide conceitualmente assim:

ligeirinho.pde
├── Configurações Globais
├── setup()                       # Inicialização
├── draw()                        # Loop principal
├── updatePlayer()                # Movimento do personagem
├── escolherNovoAlvo()            # Alvos aleatórios
├── updateCamera()                # Câmera suave
├── drawGrid()                    # Renderização do cenário
├── drawLightSource()             # Luz
└── drawLigeirinhoSprite()        # Sprites e animação


---

## 1.3 Fluxo de Dados (Game Loop)

draw()
 ├─ updatePlayer()
 │    ├─ Calcula direção até o alvo
 │    ├─ Alterna entre caminhar ↔ parado
 │    └─ Escolhe novo destino
 │
 ├─ updateCamera()
 │    └─ Câmera segue suavemente o jogador
 │
 ├─ drawGrid()
 │
 ├─ drawLightSource()
 │
 └─ drawLigeirinhoSprite()
      └─ Renderiza e anima o personagem


---

## 2. Algoritmos Implementados

### 2.1 Movimento Vetorial Automático

O movimento do personagem é baseado em operações vetoriais (`PVector`):

- **Direção:**  
  `direcao = targetPos - playerPos`
- **Normalização:**  
  `direcao.normalize()`
- **Escala pela velocidade:**  
  `direcao.mult(playerSpeed)`
- **Movimento final:**  
  `playerPos.add(direcao)`

Para evitar tremores quando está próximo do destino:


if (dist < playerSpeed) playerPos = targetPos;


---

### 2.2 IA Simples – Caminhada Aleatória

O personagem alterna entre dois estados:

- **ANDANDO**: caminha até o alvo usando vetores.
- **PARADO**: espera entre 500–2000 ms antes de caminhar novamente.

Fluxo:



PARADO → (timeout) → ANDANDO → (chegou) → PARADO


A função escolherNovoAlvo() define alvos aleatórios dentro dos limites do mundo.

### 2.3 Sistema de Câmera Suave

A câmera segue o jogador utilizando interpolação linear (lerp):

cameraPos.x = lerp(cameraPos.x, targetX, 0.1);
cameraPos.y = lerp(cameraPos.y, targetY, 0.1);


Isso cria um movimento suave e natural, evitando travamentos ou saltos bruscos.

### 2.4 Iluminação por Distância

Cada tile do grid calcula seu brilho pela distância à luz:

brightness = map(distToLight, 0 → 600, 255 → 20)


Tiles mais próximos da luz ficam mais claros.

### 2.5 Animação de Sprites (2 Frames)

Quando estaAndando == true, a animação alterna entre dois frames:

int frameAnimacao = (frameCount / 5) % 2;
image(imgCorrendo[frameAnimacao]);


Quando parado, usa:

image(imgParado);

### 2.6 Espelhamento Horizontal (Flip)

Dependendo da direção do movimento, o sprite é invertido:

scale(direcao, 1);


Valores:

1 = olhando para a direita

-1 = olhando para a esquerda

3. Decisões de Projeto
### 3.1 Uso de PVectors

Motivo:

Facilita cálculos vetoriais

Torna a movimentação mais natural

Melhora a legibilidade

### 3.2 Mundo Maior que a Tela

O mundo é maior que a janela:

Mundo: 2000 x 1500

Tela: 800 x 600

Isso permite um sistema real de câmera com scrolling.

### 3.3 Animação Simples em 2 Frames

Justificativa:
Mantém fluidez visual sem exigir muitos sprites.
Ideal para um jogo simples em Processing.

### 3.4 Câmera Suave com Lerp

Vantagens:

Suaviza movimentos

Evita jitter

Centra visualmente o personagem

### 3.5 Espera Aleatória (millis)

Permite comportamento “mais vivo”:

tempoParado = millis() + random(500, 2000);


---

## 4. Tecnologias Utilizadas

| Tecnologia | Uso |
|-----------|-----|
| **Processing (Java)** | Base do programa |
| **PVector** | Movimentação e direção |
| **PImage** | Sprites |
| **Transformações 2D** | `translate()`, `scale()`, `pushMatrix()` |
| **millis()** | Controle de tempo e estados |
| **frameCount** | Animação |

---

