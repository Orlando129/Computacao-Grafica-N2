/**
 * Módulo para gerenciar pontos de controle
 * Responsável por armazenar, manipular e interagir com os pontos
 */

export class ControlPointsManager {
    constructor() {
        this.points = [];
        this.selectedPointIndex = -1;
        this.isDragging = false;
        this.hoverPointIndex = -1;
    }

    /**
     * Adiciona um novo ponto de controle
     * @param {number} x - Coordenada x
     * @param {number} y - Coordenada y
     * @param {number} weight - Peso do ponto (padrão 1.0)
     * @returns {number} Índice do ponto adicionado
     */
    addPoint(x, y, weight = 1.0) {
        this.points.push({
            x: x,
            y: y,
            weight: weight,
            id: Date.now() + Math.random() // ID único
        });
        return this.points.length - 1;
    }

    /**
     * Remove um ponto pelo índice
     * @param {number} index - Índice do ponto
     * @returns {boolean} True se removido com sucesso
     */
    removePoint(index) {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
            if (this.selectedPointIndex === index) {
                this.selectedPointIndex = -1;
            } else if (this.selectedPointIndex > index) {
                this.selectedPointIndex--;
            }
            return true;
        }
        return false;
    }

    /**
     * Remove o último ponto
     * @returns {boolean} True se removido com sucesso
     */
    removeLastPoint() {
        if (this.points.length > 0) {
            this.points.pop();
            if (this.selectedPointIndex >= this.points.length) {
                this.selectedPointIndex = -1;
            }
            return true;
        }
        return false;
    }

    /**
     * Remove todos os pontos
     */
    clearPoints() {
        this.points = [];
        this.selectedPointIndex = -1;
        this.isDragging = false;
        this.hoverPointIndex = -1;
    }

    /**
     * Move um ponto para uma nova posição
     * @param {number} index - Índice do ponto
     * @param {number} x - Nova coordenada x
     * @param {number} y - Nova coordenada y
     * @returns {boolean} True se movido com sucesso
     */
    movePoint(index, x, y) {
        if (index >= 0 && index < this.points.length) {
            this.points[index].x = x;
            this.points[index].y = y;
            return true;
        }
        return false;
    }

    /**
     * Atualiza o peso de um ponto
     * @param {number} index - Índice do ponto
     * @param {number} weight - Novo peso
     * @returns {boolean} True se atualizado com sucesso
     */
    updateWeight(index, weight) {
        if (index >= 0 && index < this.points.length) {
            this.points[index].weight = Math.max(0.1, weight); // Peso mínimo 0.1
            return true;
        }
        return false;
    }

    /**
     * Obtém um ponto pelo índice
     * @param {number} index - Índice do ponto
     * @returns {Object|null} Ponto ou null
     */
    getPoint(index) {
        return (index >= 0 && index < this.points.length) ? this.points[index] : null;
    }

    /**
     * Obtém todos os pontos
     * @returns {Array} Array de pontos
     */
    getAllPoints() {
        return [...this.points];
    }

    /**
     * Define todos os pontos de uma vez
     * @param {Array} points - Array de pontos
     */
    setAllPoints(points) {
        this.points = points.map(p => ({
            x: p.x,
            y: p.y,
            weight: p.weight || 1.0,
            id: p.id || Date.now() + Math.random()
        }));
        this.selectedPointIndex = -1;
        this.isDragging = false;
    }

    /**
     * Obtém o número de pontos
     * @returns {number} Número de pontos
     */
    getPointCount() {
        return this.points.length;
    }

    /**
     * Verifica se um ponto está próximo de uma coordenada
     * @param {number} x - Coordenada x
     * @param {number} y - Coordenada y
     * @param {number} threshold - Distância máxima (padrão 10)
     * @returns {number} Índice do ponto ou -1
     */
    findPointNear(x, y, threshold = 10) {
        for (let i = this.points.length - 1; i >= 0; i--) {
            const dx = this.points[i].x - x;
            const dy = this.points[i].y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= threshold) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Seleciona um ponto pelo índice
     * @param {number} index - Índice do ponto (-1 para desselecionar)
     */
    selectPoint(index) {
        if (index === -1 || (index >= 0 && index < this.points.length)) {
            this.selectedPointIndex = index;
        }
    }

    /**
     * Obtém o índice do ponto selecionado
     * @returns {number} Índice ou -1
     */
    getSelectedIndex() {
        return this.selectedPointIndex;
    }

    /**
     * Inicia o arrasto de um ponto
     * @param {number} index - Índice do ponto
     */
    startDragging(index) {
        if (index >= 0 && index < this.points.length) {
            this.selectedPointIndex = index;
            this.isDragging = true;
        }
    }

    /**
     * Finaliza o arrasto
     */
    stopDragging() {
        this.isDragging = false;
    }

    /**
     * Verifica se está arrastando
     * @returns {boolean}
     */
    isCurrentlyDragging() {
        return this.isDragging;
    }

    /**
     * Define o ponto sobre o qual o mouse está
     * @param {number} index - Índice do ponto (-1 para nenhum)
     */
    setHoverPoint(index) {
        this.hoverPointIndex = index;
    }

    /**
     * Obtém o índice do ponto em hover
     * @returns {number}
     */
    getHoverIndex() {
        return this.hoverPointIndex;
    }

    /**
     * Exporta os pontos para JSON
     * @returns {string} JSON string
     */
    exportToJSON() {
        const data = {
            points: this.points.map((p, index) => ({
                index: index,
                x: Math.round(p.x * 100) / 100,
                y: Math.round(p.y * 100) / 100,
                weight: Math.round(p.weight * 100) / 100
            })),
            count: this.points.length,
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa pontos de JSON
     * @param {string} jsonString - String JSON
     * @returns {boolean} True se importado com sucesso
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.points && Array.isArray(data.points)) {
                this.clearPoints();
                data.points.forEach(p => {
                    this.addPoint(p.x, p.y, p.weight || 1.0);
                });
                return true;
            }
        } catch (e) {
            console.error('Erro ao importar JSON:', e);
        }
        return false;
    }

    /**
     * Calcula o centro geométrico dos pontos
     * @returns {Object} {x, y} centro ou null
     */
    getCenter() {
        if (this.points.length === 0) return null;

        let sumX = 0;
        let sumY = 0;

        this.points.forEach(p => {
            sumX += p.x;
            sumY += p.y;
        });

        return {
            x: sumX / this.points.length,
            y: sumY / this.points.length
        };
    }

    /**
     * Calcula a bounding box dos pontos
     * @returns {Object} {minX, minY, maxX, maxY} ou null
     */
    getBoundingBox() {
        if (this.points.length === 0) return null;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.points.forEach(p => {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        });

        return { minX, minY, maxX, maxY };
    }

    /**
     * Aplica uma transformação a todos os pontos
     * @param {Function} transform - Função (point) => {x, y}
     */
    transformAllPoints(transform) {
        this.points = this.points.map(p => {
            const transformed = transform(p);
            return {
                ...p,
                x: transformed.x,
                y: transformed.y
            };
        });
    }

    /**
     * Escala todos os pontos a partir de um centro
     * @param {number} scale - Fator de escala
     * @param {Object} center - Centro da escala {x, y} (opcional)
     */
    scalePoints(scale, center = null) {
        const c = center || this.getCenter();
        if (!c) return;

        this.transformAllPoints(p => ({
            x: c.x + (p.x - c.x) * scale,
            y: c.y + (p.y - c.y) * scale
        }));
    }

    /**
     * Translada todos os pontos
     * @param {number} dx - Deslocamento em x
     * @param {number} dy - Deslocamento em y
     */
    translatePoints(dx, dy) {
        this.transformAllPoints(p => ({
            x: p.x + dx,
            y: p.y + dy
        }));
    }

    /**
     * Rotaciona todos os pontos ao redor de um centro
     * @param {number} angle - Ângulo em radianos
     * @param {Object} center - Centro da rotação {x, y} (opcional)
     */
    rotatePoints(angle, center = null) {
        const c = center || this.getCenter();
        if (!c) return;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        this.transformAllPoints(p => {
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            return {
                x: c.x + dx * cos - dy * sin,
                y: c.y + dx * sin + dy * cos
            };
        });
    }
}
