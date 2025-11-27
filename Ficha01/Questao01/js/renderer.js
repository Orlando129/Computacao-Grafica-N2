/**
 * Módulo para renderização de curvas e pontos no canvas
 * Responsável por toda a parte visual do projeto
 */

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelRatio = window.devicePixelRatio || 1;
        this.setupCanvas();
    }

    /**
     * Configura o canvas para alta resolução
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * Limpa o canvas
     */
    clear() {
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;
        this.ctx.clearRect(0, 0, width, height);
        
        // Fundo branco suave
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(0, 0, width, height);
    }

    /**
     * Desenha uma curva
     * @param {Array} curvePoints - Array de pontos da curva
     * @param {string} color - Cor da curva
     * @param {number} lineWidth - Largura da linha
     */
    drawCurve(curvePoints, color = '#667eea', lineWidth = 3) {
        if (curvePoints.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
        for (let i = 1; i < curvePoints.length; i++) {
            this.ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
        }

        this.ctx.stroke();
    }

    /**
     * Desenha o polígono de controle (linhas conectando os pontos)
     * @param {Array} controlPoints - Pontos de controle
     * @param {string} color - Cor das linhas
     * @param {number} lineWidth - Largura da linha
     */
    drawControlPolygon(controlPoints, color = '#cccccc', lineWidth = 1.5) {
        if (controlPoints.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineCap = 'round';

        this.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
        for (let i = 1; i < controlPoints.length; i++) {
            this.ctx.lineTo(controlPoints[i].x, controlPoints[i].y);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * Desenha um ponto de controle
     * @param {Object} point - Ponto {x, y, weight}
     * @param {number} index - Índice do ponto
     * @param {boolean} isSelected - Se o ponto está selecionado
     * @param {boolean} isHover - Se o mouse está sobre o ponto
     * @param {string} color - Cor do ponto
     */
    drawControlPoint(point, index, isSelected = false, isHover = false, color = '#667eea') {
        const x = point.x;
        const y = point.y;
        const baseRadius = 6;
        
        // Aumenta o raio se selecionado ou em hover
        const radius = isSelected ? baseRadius * 1.5 : (isHover ? baseRadius * 1.3 : baseRadius);

        // Sombra para hover ou seleção
        if (isSelected || isHover) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 2;
        }

        // Círculo externo (borda)
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = isSelected ? '#2196F3' : (isHover ? '#764ba2' : '#ffffff');
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Círculo interno
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Remove sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Desenha o número do ponto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(index.toString(), x, y);
    }

    /**
     * Desenha todos os pontos de controle
     * @param {Array} controlPoints - Array de pontos
     * @param {number} selectedIndex - Índice do ponto selecionado
     * @param {number} hoverIndex - Índice do ponto em hover
     * @param {string} color - Cor dos pontos
     */
    drawAllControlPoints(controlPoints, selectedIndex = -1, hoverIndex = -1, color = '#667eea') {
        controlPoints.forEach((point, index) => {
            const isSelected = index === selectedIndex;
            const isHover = index === hoverIndex;
            this.drawControlPoint(point, index, isSelected, isHover, color);
        });
    }

    /**
     * Desenha o peso de um ponto (visualização)
     * @param {Object} point - Ponto {x, y, weight}
     * @param {number} index - Índice do ponto
     */
    drawWeight(point, index) {
        const x = point.x;
        const y = point.y;
        const weight = point.weight || 1.0;

        // Desenha um círculo proporcional ao peso
        const radius = 15 + (weight - 1) * 10;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Texto com o valor do peso
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`w=${weight.toFixed(2)}`, x, y + radius + 5);
    }

    /**
     * Desenha todos os pesos
     * @param {Array} controlPoints - Array de pontos
     */
    drawAllWeights(controlPoints) {
        controlPoints.forEach((point, index) => {
            if (point.weight && point.weight !== 1.0) {
                this.drawWeight(point, index);
            }
        });
    }

    /**
     * Desenha as coordenadas de um ponto
     * @param {Object} point - Ponto {x, y}
     * @param {number} index - Índice do ponto
     */
    drawCoordinates(point, index) {
        const x = point.x;
        const y = point.y;
        const text = `P${index}: (${Math.round(x)}, ${Math.round(y)})`;

        // Fundo para o texto
        this.ctx.font = '11px Arial';
        const textWidth = this.ctx.measureText(text).width;
        const padding = 6;
        const rectX = x + 15;
        const rectY = y - 20;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(rectX, rectY, textWidth + padding * 2, 20);
        this.ctx.strokeRect(rectX, rectY, textWidth + padding * 2, 20);

        // Texto
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, rectX + padding, rectY + 10);
    }

    /**
     * Desenha informações sobre a curva
     * @param {Object} info - Objeto com informações {title, points, degree, etc}
     */
    drawCurveInfo(info) {
        const x = 10;
        let y = 10;
        const lineHeight = 20;

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        if (info.title) {
            this.ctx.fillText(info.title, x, y);
            y += lineHeight;
        }

        this.ctx.font = '12px Arial';
        
        if (info.points !== undefined) {
            this.ctx.fillText(`Pontos de Controle: ${info.points}`, x, y);
            y += lineHeight;
        }

        if (info.degree !== undefined) {
            this.ctx.fillText(`Grau: ${info.degree}`, x, y);
            y += lineHeight;
        }

        if (info.steps !== undefined) {
            this.ctx.fillText(`Passos: ${info.steps}`, x, y);
            y += lineHeight;
        }
    }

    /**
     * Desenha uma grade de fundo
     * @param {number} spacing - Espaçamento da grade
     * @param {string} color - Cor da grade
     */
    drawGrid(spacing = 50, color = '#e0e0e0') {
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;

        // Linhas verticais
        for (let x = 0; x <= width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Linhas horizontais
        for (let y = 0; y <= height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha eixos cartesianos
     * @param {Object} origin - Origem {x, y}
     * @param {string} color - Cor dos eixos
     */
    drawAxes(origin, color = '#999999') {
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;

        // Eixo X
        this.ctx.beginPath();
        this.ctx.moveTo(0, origin.y);
        this.ctx.lineTo(width, origin.y);
        this.ctx.stroke();

        // Eixo Y
        this.ctx.beginPath();
        this.ctx.moveTo(origin.x, 0);
        this.ctx.lineTo(origin.x, height);
        this.ctx.stroke();

        // Setas
        const arrowSize = 10;
        
        // Seta X
        this.ctx.beginPath();
        this.ctx.moveTo(width - arrowSize, origin.y - arrowSize / 2);
        this.ctx.lineTo(width, origin.y);
        this.ctx.lineTo(width - arrowSize, origin.y + arrowSize / 2);
        this.ctx.stroke();

        // Seta Y
        this.ctx.beginPath();
        this.ctx.moveTo(origin.x - arrowSize / 2, arrowSize);
        this.ctx.lineTo(origin.x, 0);
        this.ctx.lineTo(origin.x + arrowSize / 2, arrowSize);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('X', width - 15, origin.y + 20);
        this.ctx.fillText('Y', origin.x + 20, 15);
    }

    /**
     * Converte coordenadas do canvas para coordenadas do mouse
     * @param {number} clientX - X do evento
     * @param {number} clientY - Y do evento
     * @returns {Object} {x, y} coordenadas no canvas
     */
    getCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    /**
     * Obtém as dimensões do canvas
     * @returns {Object} {width, height}
     */
    getCanvasSize() {
        return {
            width: this.canvas.width / this.pixelRatio,
            height: this.canvas.height / this.pixelRatio
        };
    }

    /**
     * Redimensiona o canvas
     */
    resize() {
        this.setupCanvas();
    }

    /**
     * Desenha uma mensagem no centro do canvas
     * @param {string} message - Mensagem a ser exibida
     */
    drawCenteredMessage(message) {
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(message, width / 2, height / 2);
    }
}
