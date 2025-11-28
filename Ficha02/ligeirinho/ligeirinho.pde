// --- Configurações Globais ---
PVector playerPos;
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
  
  // Inicializa posições
  playerPos = new PVector(worldWidth / 2, worldHeight / 2);
  cameraPos = new PVector(0, 0);
  lightPos = new PVector(worldWidth / 2 + 100, worldHeight / 2 - 100);
  
  // --- CARREGAMENTO DAS IMAGENS ---
  // Certifique-se que as imagens estão na pasta "data" do sketch
  // Se der erro aqui, é porque o Processing não achou o arquivo
  imgParado = loadImage("parado.png");
  imgCorrendo[0] = loadImage("correndo1.png");
  imgCorrendo[1] = loadImage("correndo2.png");
  
  // Alinha o desenho das imagens pelo CENTRO (importante para inverter lado)
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
  estaAndando = false; // Resetamos o estado a cada frame
  
  if (keyPressed) {
    if (keyCode == UP) { playerPos.y -= playerSpeed; estaAndando = true; }
    if (keyCode == DOWN) { playerPos.y += playerSpeed; estaAndando = true; }
    
    if (keyCode == LEFT) { 
      playerPos.x -= playerSpeed; 
      estaAndando = true; 
      direcao = -1; // Olha para esquerda
    }
    if (keyCode == RIGHT) { 
      playerPos.x += playerSpeed; 
      estaAndando = true; 
      direcao = 1; // Olha para direita
    }
  }
  
  playerPos.x = constrain(playerPos.x, 0, worldWidth);
  playerPos.y = constrain(playerPos.y, 0, worldHeight);
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
