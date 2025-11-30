// --- Configurações Globais ---
PVector playerPos;
PVector targetPos;    // Onde ele quer chegar
int tempoParado = 0;  // Cronômetro para ele esperar um pouco antes de correr de novo
float playerSpeed = 8.0; // Aumentei um pouco a velocidade
PVector cameraPos;

// Dimensões do Mundo
int worldWidth = 2000;
int worldHeight = 1500;
PVector lightPos;

// --- NOVAS VARIÁVEIS PARA SPRITES ---
PImage imgParado;
PImage[] imgCorrendo = new PImage[2]; // Array para guardar os frames de corrida
int direcao = 1; // 1 = Direita, -1 = Esquerda
boolean estaAndando = false;

void setup() {
  size(800, 600);
  noStroke();
  
  // Inicializa posições (Igual ao anterior)
  playerPos = new PVector(worldWidth / 2, worldHeight / 2);
  cameraPos = new PVector(0, 0);
  lightPos = new PVector(worldWidth / 2 + 100, worldHeight / 2 - 100);
  
  // --- NOVO: Define o primeiro alvo aleatório ---
  escolherNovoAlvo(); 

  // Carregamento de imagens continua igual...
  imgParado = loadImage("parado.png");
  imgCorrendo[0] = loadImage("correndo1.png");
  imgCorrendo[1] = loadImage("correndo2.png");
  imageMode(CENTER);
}

void draw() {
  updatePlayer();
  updateCamera();
  
  background(0);

  // Transformação de Visualização (Câmera)
  pushMatrix();
  translate(-cameraPos.x, -cameraPos.y);
  
  drawGrid();      
  drawLightSource();
  drawLigeirinhoSprite();  // <--- Função nova aqui
  
  popMatrix();
  
  // UI
  fill(255);
  text("Setas para mover. FPS: " + frameRate, 10, 20);
}

void updatePlayer() {
  // Verificamos se ele deve estar correndo ou esperando
  if (millis() > tempoParado) {
    estaAndando = true;
    
    // 1. CÁLCULO VETORIAL DE DIREÇÃO
    // Direção = Destino - Posição Atual
    PVector direcaoMovimento = PVector.sub(targetPos, playerPos);
    
    // 2. CONTROLE DO SPRITE (ESQUERDA/DIREITA)
    // Se o X do destino for maior que o atual, olha pra direita (1), senão esquerda (-1)
    if (direcaoMovimento.x > 0) direcao = 1; 
    else direcao = -1;
    
    // 3. MOVER OU CHEGAR
    // Se a distância for menor que a velocidade, ele chegou (para evitar tremedeira)
    if (direcaoMovimento.mag() < playerSpeed) {
      playerPos = targetPos.copy(); // "Snap" para a posição final exata
      estaAndando = false;          // Para a animação
      
      // Define um tempo de espera (ex: entre 500ms e 2 segundos)
      tempoParado = millis() + int(random(500, 2000)); 
      
      // Escolhe para onde vai correr depois de descansar
      escolherNovoAlvo();
      
    } else {
      // Se ainda está longe, normalizamos o vetor (tamanho 1) e multiplicamos pela velocidade
      direcaoMovimento.normalize();
      direcaoMovimento.mult(playerSpeed);
      playerPos.add(direcaoMovimento);
    }
    
  } else {
    // Se estamos no tempo de espera
    estaAndando = false;
  }
  
  // Mantém ele dentro do mundo (segurança)
  playerPos.x = constrain(playerPos.x, 0, worldWidth);
  playerPos.y = constrain(playerPos.y, 0, worldHeight);
}

// --- FUNÇÃO AUXILIAR NOVA ---
void escolherNovoAlvo() {
  // Sorteia uma posição X e Y dentro do tamanho do mundo (menos uma margem)
  float x = random(50, worldWidth - 50);
  float y = random(50, worldHeight - 50);
  targetPos = new PVector(x, y);
}

void updateCamera() {
  float targetX = playerPos.x - width / 2;
  float targetY = playerPos.y - height / 2;
  targetX = constrain(targetX, 0, worldWidth - width);
  targetY = constrain(targetY, 0, worldHeight - height);
  cameraPos.x = lerp(cameraPos.x, targetX, 0.1);
  cameraPos.y = lerp(cameraPos.y, targetY, 0.1);
}

void drawGrid() {
  int tileSize = 50;
  for (int x = 0; x < worldWidth; x += tileSize) {
    for (int y = 0; y < worldHeight; y += tileSize) {
      if (x + tileSize < cameraPos.x || x > cameraPos.x + width ||
          y + tileSize < cameraPos.y || y > cameraPos.y + height) continue; 
      
      float distToLight = dist(x, y, lightPos.x, lightPos.y);
      float brightness = map(distToLight, 0, 600, 255, 20);
      brightness = constrain(brightness, 20, 255);
      
      fill(brightness, 100, 100); 
      rect(x, y, tileSize+1, tileSize+1); // +1 para tirar linhas pretas entre tiles
    }
  }
}

void drawLightSource() {
  fill(255, 255, 0);
  ellipse(lightPos.x, lightPos.y, 30, 30);
}

// --- NOVA FUNÇÃO DE DESENHO DO PERSONAGEM ---
void drawLigeirinhoSprite() {
  pushMatrix();
  
  // 1. Move para a posição do jogador
  translate(playerPos.x, playerPos.y);
  
  // 2. Espelhamento Horizontal (Flip)
  // Se direcao for -1, ele inverte o eixo X da imagem
  scale(direcao, 1); 
  
  if (estaAndando) {
    // Lógica de Animação:
    // frameCount é um contador global do Processing.
    // O operador % (módulo) cria um ciclo.
    // A cada 10 frames (velocidade), trocamos entre imagem 0 e 1.
    int frameAnimacao = (frameCount / 5) % 2; 
    
    // Desenha a imagem correspondente
    image(imgCorrendo[frameAnimacao], 0, 0, 60, 60); // 60,60 é o tamanho na tela
  } else {
    // Desenha parado
    image(imgParado, 0, 0, 60, 60);
  }
  
  popMatrix();
}
